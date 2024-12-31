import { threats, type SelectThreat } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI();

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

class ThreatPredictor {
  private static instance: ThreatPredictor;
  private predictionCache: Map<number, PredictionResult>;
  private lastUpdateTime: number;

  private constructor() {
    this.predictionCache = new Map();
    this.lastUpdateTime = 0;
  }

  public static getInstance(): ThreatPredictor {
    if (!ThreatPredictor.instance) {
      ThreatPredictor.instance = new ThreatPredictor();
    }
    return ThreatPredictor.instance;
  }

  public async getPredictions(): Promise<PredictionResult[]> {
    const currentTime = Date.now();
    // Update predictions every 30 seconds
    if (currentTime - this.lastUpdateTime > 30000) {
      await this.updatePredictions();
      this.lastUpdateTime = currentTime;
    }

    return Array.from(this.predictionCache.values());
  }

  private async updatePredictions(): Promise<void> {
    try {
      // Fetch recent threats from the database
      const recentThreats = await db.select().from(threats)
        .orderBy(threats.timestamp)
        .limit(100);

      // Process each threat through ML model and OpenAI
      for (const threat of recentThreats) {
        const prediction = await this.predictThreat(threat);
        this.predictionCache.set(threat.id, prediction);
      }
    } catch (error) {
      console.error('Error updating predictions:', error);
    }
  }

  private async predictThreat(threat: SelectThreat): Promise<PredictionResult> {
    // Calculate risk score based on various factors
    const riskScore = this.calculateRiskScore(threat);

    // Determine severity based on risk score
    const severity = this.getSeverityLevel(riskScore);

    // Calculate probability based on historical patterns
    const probability = this.calculateProbability(threat);

    // Get AI-powered insights
    const aiInsights = await this.getAIInsights(threat);

    // Determine trend direction
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

  private async getAIInsights(threat: SelectThreat): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a cybersecurity threat analyst. Analyze the given threat data and provide concise insights about its potential impact and evolution."
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

  private async analyzeTrendDirection(threat: SelectThreat): Promise<'increasing' | 'stable' | 'decreasing'> {
    try {
      // Get historical threats of the same type
      const historicalThreats = await db
        .select()
        .from(threats)
        .where(eq(threats.type, threat.type))
        .orderBy(threats.timestamp);

      if (historicalThreats.length < 2) {
        return 'stable';
      }

      // Analyze trend using risk scores
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

  private calculateRiskScore(threat: SelectThreat): number {
    let score = 0;

    // Base score from severity
    if (threat.severity === 'critical') score += 100;
    else if (threat.severity === 'high') score += 75;
    else if (threat.severity === 'medium') score += 50;
    else score += 25;

    // Adjust based on confidence
    score *= (threat.confidence || 0.5);

    // Additional factors
    if (threat.indicators) score += Object.keys(threat.indicators).length * 5;

    return Math.min(100, Math.max(0, score));
  }

  private getSeverityLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  private calculateProbability(threat: SelectThreat): number {
    return (threat.confidence || 0.5) * 
           (threat.severity === 'critical' ? 0.9 : 
            threat.severity === 'high' ? 0.7 :
            threat.severity === 'medium' ? 0.5 : 0.3);
  }

  private extractIndicators(threat: SelectThreat): string[] {
    const indicators: string[] = [];

    if (threat.indicators) {
      const threatIndicators = threat.indicators as Record<string, any>;
      Object.entries(threatIndicators).forEach(([key, value]) => {
        indicators.push(`${key}: ${value}`);
      });
    }

    return indicators;
  }
}

export const threatPredictor = ThreatPredictor.getInstance();