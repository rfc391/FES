
import { threats, type SelectThreat } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";
import OpenAI from "openai";

interface PredictionResult {
  threatId: number;
  probability: number;
  riskScore: number;
  predictedSeverity: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  timestamp: string;
  aiInsights?: string;
  trendDirection?: 'increasing' | 'stable' | 'decreasing';
}

type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
type TrendDirection = 'increasing' | 'stable' | 'decreasing';

class ThreatPredictor {
  private static instance: ThreatPredictor;
  private predictionCache: Map<number, PredictionResult>;
  private lastUpdateTime: number;
  private openai: OpenAI;
  
  private constructor() {
    this.predictionCache = new Map();
    this.lastUpdateTime = 0;
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key is missing. AI-powered features will be disabled.');
      this.openai = null;
    } else {
      this.openai = new OpenAI({ apiKey });
    }
  }

  public static getInstance(): ThreatPredictor {
    if (!ThreatPredictor.instance) {
      ThreatPredictor.instance = new ThreatPredictor();
    }
    return ThreatPredictor.instance;
  }

  public async getPredictions(): Promise<PredictionResult[]> {
    const CACHE_TTL = 30000; // 30 seconds
    const shouldUpdate = Date.now() - this.lastUpdateTime > CACHE_TTL;
    
    if (shouldUpdate) {
      await this.updatePredictions();
      this.lastUpdateTime = Date.now();
    }

    return Array.from(this.predictionCache.values());
  }

  private async updatePredictions(): Promise<void> {
    try {
      const recentThreats = await db.select()
        .from(threats)
        .orderBy(threats.timestamp)
        .limit(100);

      for (const threat of recentThreats) {
        const prediction = await this.predictThreat(threat);
        this.predictionCache.set(threat.id, prediction);
      }
    } catch (error) {
      console.error('Error updating predictions:', error);
    }
  }

  private calculateRiskScore(threat: SelectThreat): number {
    const severityScores = {
      critical: 100,
      high: 75,
      medium: 50,
      low: 25
    };
    
    let score = severityScores[threat.severity] || 25;
    score *= (threat.confidence || 0.5);
    
    if (threat.indicators) {
      score += Object.keys(threat.indicators).length * 5;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  private getSeverityLevel(riskScore: number): SeverityLevel {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  private calculateProbability(threat: SelectThreat): number {
    const severityMultipliers = {
      critical: 0.9,
      high: 0.7,
      medium: 0.5,
      low: 0.3
    };
    
    return (threat.confidence || 0.5) * severityMultipliers[threat.severity];
  }

  private async predictThreat(threat: SelectThreat): Promise<PredictionResult> {
    const riskScore = this.calculateRiskScore(threat);
    const severity = this.getSeverityLevel(riskScore);
    const probability = this.calculateProbability(threat);
    const aiInsights = await this.getAIInsights(threat);
    const trendDirection = await this.analyzeTrendDirection(threat);

    return {
      threatId: threat.id,
      probability,
      riskScore,
      predictedSeverity: severity,
      indicators: this.extractIndicators(threat),
      timestamp: new Date().toISOString(),
      aiInsights,
      trendDirection,
    };
  }

  private extractIndicators(threat: SelectThreat): string[] {
    if (!threat.indicators) return [];
    
    return Object.entries(threat.indicators as Record<string, any>)
      .map(([key, value]) => `${key}: ${value}`);
  }

  private async getAIInsights(threat: SelectThreat): Promise<string> {
    if (!this.openai) {
      return "AI insights unavailable - API key not configured";
    }
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a cybersecurity threat analyst. Analyze the given threat data and provide concise insights."
          },
          {
            role: "user",
            content: JSON.stringify({
              type: threat.type,
              severity: threat.severity,
              source: threat.source,
              indicators: threat.indicators,
              details: threat.details,
            })
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      return response.choices[0].message.content || "No insights available";
    } catch (error) {
      console.error('Error getting AI insights:', error);
      return "AI insights temporarily unavailable";
    }
  }

  private async analyzeTrendDirection(threat: SelectThreat): Promise<TrendDirection> {
    try {
      const historicalThreats = await db
        .select()
        .from(threats)
        .where(eq(threats.type, threat.type))
        .orderBy(threats.timestamp);

      if (historicalThreats.length < 2) return 'stable';

      const recentScores = historicalThreats
        .slice(-5)
        .map(t => this.calculateRiskScore(t));

      const avgRecent = recentScores.slice(-2).reduce((a, b) => a + b, 0) / 2;
      const avgPrevious = recentScores.slice(0, -2).reduce((a, b) => a + b, 0) / (recentScores.length - 2);

      if (avgRecent > avgPrevious * 1.1) return 'increasing';
      if (avgRecent < avgPrevious * 0.9) return 'decreasing';
      return 'stable';
    } catch (error) {
      console.error('Error analyzing trend:', error);
      return 'stable';
    }
  }
}

export const threatPredictor = ThreatPredictor.getInstance();
