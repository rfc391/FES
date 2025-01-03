import { db } from "@db";
import { WebSocket } from "ws";
import { threats, threatIntelligence, users, type SelectThreatIntelligence } from "@db/schema";
import { eq, desc } from "drizzle-orm";

interface Client {
  ws: WebSocket;
  userId: number;
}

interface VerificationRecord {
  userId: number;
  timestamp: string;
  status: 'verified' | 'disputed' | 'pending';
}

interface EndorsementRecord {
  userId: number;
  timestamp: string;
  comment: string;
}

export class ThreatIntelligenceService {
  private static instance: ThreatIntelligenceService;
  private clients: Client[] = [];

  private constructor() {}

  public static getInstance(): ThreatIntelligenceService {
    if (!ThreatIntelligenceService.instance) {
      ThreatIntelligenceService.instance = new ThreatIntelligenceService();
    }
    return ThreatIntelligenceService.instance;
  }

  public addClient(ws: WebSocket, userId: number): void {
    this.clients.push({ ws, userId });

    ws.on('close', () => {
      this.clients = this.clients.filter(client => client.ws !== ws);
    });
  }

  public async broadcastUpdate(intelligence: SelectThreatIntelligence): Promise<void> {
    const message = JSON.stringify({
      type: 'intelligence_update',
      data: intelligence
    });

    this.clients.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  public async shareThreatIntelligence(
    userId: number,
    threatId: number,
    insights: string,
    tags: string[],
    shareScope: 'public' | 'private' | 'trusted' = 'public'
  ): Promise<SelectThreatIntelligence> {
    // Create new threat intelligence entry
    const [intelligence] = await db
      .insert(threatIntelligence)
      .values({
        threatId,
        sharedBy: userId,
        insights,
        tags,
        shareScope,
        timestamp: new Date(),
        lastContributor: userId,
        collaborators: [userId],
        verificationStatus: 'pending',
        confidenceScore: 0.7,
      })
      .returning();

    // Mark the threat as shared
    await db
      .update(threats)
      .set({ isShared: true })
      .where(eq(threats.id, threatId));

    // Broadcast to connected clients
    await this.broadcastUpdate(intelligence);

    return intelligence;
  }

  public async verifyIntelligence(
    intelligenceId: number,
    userId: number,
    verificationStatus: 'verified' | 'disputed' | 'pending'
  ): Promise<void> {
    const [existingIntel] = await db
      .select()
      .from(threatIntelligence)
      .where(eq(threatIntelligence.id, intelligenceId))
      .limit(1);

    if (!existingIntel) {
      throw new Error('Intelligence not found');
    }

    const verifiedBy = existingIntel.verifiedBy as VerificationRecord[] || [];
    verifiedBy.push({
      userId,
      timestamp: new Date().toISOString(),
      status: verificationStatus,
    });

    const [intelligence] = await db
      .update(threatIntelligence)
      .set({
        verificationStatus,
        verifiedBy,
      })
      .where(eq(threatIntelligence.id, intelligenceId))
      .returning();

    await this.broadcastUpdate(intelligence);
  }

  public async addEndorsement(
    intelligenceId: number,
    userId: number,
    comment: string
  ): Promise<void> {
    const [existingIntel] = await db
      .select()
      .from(threatIntelligence)
      .where(eq(threatIntelligence.id, intelligenceId))
      .limit(1);

    if (!existingIntel) {
      throw new Error('Intelligence not found');
    }

    const endorsements = existingIntel.endorsements as EndorsementRecord[] || [];
    endorsements.push({
      userId,
      timestamp: new Date().toISOString(),
      comment,
    });

    const [intelligence] = await db
      .update(threatIntelligence)
      .set({ endorsements })
      .where(eq(threatIntelligence.id, intelligenceId))
      .returning();

    await this.broadcastUpdate(intelligence);
  }

  public async getCollaborativeThreatIntelligence(
    userId: number,
    shareScope?: 'public' | 'private' | 'trusted'
  ): Promise<SelectThreatIntelligence[]> {
    const query = shareScope
      ? await db
          .select()
          .from(threatIntelligence)
          .where(eq(threatIntelligence.shareScope, shareScope))
          .orderBy(desc(threatIntelligence.timestamp))
      : await db
          .select()
          .from(threatIntelligence)
          .orderBy(desc(threatIntelligence.timestamp));

    return query;
  }
}

export const threatIntelligenceService = ThreatIntelligenceService.getInstance();