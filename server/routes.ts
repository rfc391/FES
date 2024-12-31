import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { db } from "@db";
import { setupAuth } from "./auth";
import { threats, riskProfiles, threatIntelligence } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { threatPredictor } from "./ml/threatPredictor";
import { riskProfileService } from "./services/RiskProfileService";
import { threatIntelligenceService } from "./services/ThreatIntelligenceService";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Threat Intelligence Routes
  app.post('/api/threat-intelligence/share', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { threatId, insights, tags, shareScope } = req.body;
      const intelligence = await threatIntelligenceService.shareThreatIntelligence(
        req.user.id,
        threatId,
        insights,
        tags,
        shareScope
      );

      res.json(intelligence);
    } catch (error) {
      console.error('Error sharing threat intelligence:', error);
      res.status(500).json({ error: 'Failed to share threat intelligence' });
    }
  });

  app.post('/api/threat-intelligence/:id/verify', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const { status } = req.body;

      await threatIntelligenceService.verifyIntelligence(
        parseInt(id),
        req.user.id,
        status
      );

      res.json({ message: 'Intelligence verification updated' });
    } catch (error) {
      console.error('Error verifying threat intelligence:', error);
      res.status(500).json({ error: 'Failed to verify threat intelligence' });
    }
  });

  app.post('/api/threat-intelligence/:id/endorse', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const { comment } = req.body;

      await threatIntelligenceService.addEndorsement(
        parseInt(id),
        req.user.id,
        comment
      );

      res.json({ message: 'Endorsement added' });
    } catch (error) {
      console.error('Error adding endorsement:', error);
      res.status(500).json({ error: 'Failed to add endorsement' });
    }
  });

  app.get('/api/threat-intelligence', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { shareScope } = req.query;
      const intelligence = await threatIntelligenceService.getCollaborativeThreatIntelligence(
        req.user.id,
        shareScope as any
      );

      res.json(intelligence);
    } catch (error) {
      console.error('Error fetching threat intelligence:', error);
      res.status(500).json({ error: 'Failed to fetch threat intelligence' });
    }
  });

  // Risk Profile Routes
  app.post('/api/risk-profile/generate', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const profile = await riskProfileService.generateProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      console.error('Error generating risk profile:', error);
      res.status(500).json({ error: 'Failed to generate risk profile' });
    }
  });

  app.get('/api/risk-profile', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const [profile] = await db
        .select()
        .from(riskProfiles)
        .where(eq(riskProfiles.userId, req.user.id))
        .limit(1);

      if (!profile) {
        return res.status(404).json({ error: 'No risk profile found' });
      }

      res.json(profile);
    } catch (error) {
      console.error('Error fetching risk profile:', error);
      res.status(500).json({ error: 'Failed to fetch risk profile' });
    }
  });

  // Existing routes
  app.get('/api/threats/predictions', async (req, res) => {
    try {
      const predictions = await threatPredictor.getPredictions();
      res.json(predictions);
    } catch (error) {
      console.error('Error getting threat predictions:', error);
      res.status(500).json({ error: 'Failed to get threat predictions' });
    }
  });

  app.get('/api/threats', async (req, res) => {
    try {
      const latestThreats = await db
        .select()
        .from(threats)
        .orderBy(desc(threats.timestamp))
        .limit(50);
      res.json(latestThreats);
    } catch (error) {
      console.error('Error fetching threats:', error);
      res.status(500).json({ error: 'Failed to fetch threats' });
    }
  });

  // WebSocket Setup for Real-time Updates
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: "/api/threat-intelligence/ws" 
  });

  wss.on("connection", (ws: WebSocket, req: any) => {
    if (!req.user) {
      ws.close(1008, 'Authentication required');
      return;
    }

    console.log(`Client connected to threat intelligence feed: ${req.user.id}`);
    threatIntelligenceService.addClient(ws, req.user.id);

    ws.on("close", () => {
      console.log(`Client disconnected from threat intelligence feed: ${req.user.id}`);
    });
  });

  return httpServer;
}