import { threats, type SelectThreat } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { spawn } from "child_process";

interface PredictionResult {
  threatId: number;
  probability: number;
  riskScore: number;
  predictedSeverity: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  timestamp: string;
}

class ThreatPredictor {
  private static instance: ThreatPredictor;
  private pythonProcess: any;
  private predictionCache: Map<number, PredictionResult>;
  private lastUpdateTime: number;

  private constructor() {
    this.predictionCache = new Map();
    this.lastUpdateTime = 0;
    this.startPythonService();
  }

  public static getInstance(): ThreatPredictor {
    if (!ThreatPredictor.instance) {
      ThreatPredictor.instance = new ThreatPredictor();
    }
    return ThreatPredictor.instance;
  }

  private startPythonService() {
    this.pythonProcess = spawn('python', ['src/ml_integration.py']);
    
    this.pythonProcess.stdout.on('data', (data: Buffer) => {
      console.log(`ML Service: ${data}`);
    });

    this.pythonProcess.stderr.on('data', (data: Buffer) => {
      console.error(`ML Service Error: ${data}`);
    });
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

      // Process each threat through the ML model
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

    return {
      threatId: threat.id,
      probability,
      riskScore,
      predictedSeverity: severity,
      indicators: this.extractIndicators(threat),
      timestamp: new Date().toISOString(),
    };
  }

  private calculateRiskScore(threat: SelectThreat): number {
    // Implement risk scoring logic based on threat attributes
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
    // Implement probability calculation based on historical data
    // For now, return a simplified calculation
    return (threat.confidence || 0.5) * 
           (threat.severity === 'critical' ? 0.9 : 
            threat.severity === 'high' ? 0.7 :
            threat.severity === 'medium' ? 0.5 : 0.3);
  }

  private extractIndicators(threat: SelectThreat): string[] {
    const indicators: string[] = [];
    
    if (threat.indicators) {
      // Extract relevant indicators from the threat data
      const threatIndicators = threat.indicators as Record<string, any>;
      Object.entries(threatIndicators).forEach(([key, value]) => {
        indicators.push(`${key}: ${value}`);
      });
    }

    return indicators;
  }
}

export const threatPredictor = ThreatPredictor.getInstance();
