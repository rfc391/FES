import { db } from "@db";
import { riskProfiles, users, threats, type SelectRiskProfile } from "@db/schema";
import { eq } from "drizzle-orm";

interface RiskCategory {
  name: string;
  score: number;
  factors: string[];
}

interface RiskProfile {
  overallScore: number;
  categories: RiskCategory[];
  recommendations: string[];
  vulnerabilities: string[];
  strengths: string[];
}

export class RiskProfileService {
  private static instance: RiskProfileService;
  private readonly categories = [
    'authentication',
    'access_patterns',
    'threat_interaction',
    'system_usage',
    'security_awareness'
  ];

  private constructor() {}

  public static getInstance(): RiskProfileService {
    if (!RiskProfileService.instance) {
      RiskProfileService.instance = new RiskProfileService();
    }
    return RiskProfileService.instance;
  }

  public async generateProfile(userId: number): Promise<RiskProfile> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    const categories = await this.calculateRiskCategories(userId);
    const overallScore = this.calculateOverallScore(categories);
    const recommendations = await this.generateRecommendations(categories);
    const { vulnerabilities, strengths } = this.identifyVulnerabilitiesAndStrengths(categories);

    // Store the profile
    await this.saveRiskProfile(userId, {
      overallScore,
      categories,
      recommendations,
      vulnerabilities,
      strengths
    });

    return {
      overallScore,
      categories,
      recommendations,
      vulnerabilities,
      strengths
    };
  }

  private async calculateRiskCategories(userId: number): Promise<RiskCategory[]> {
    return Promise.all(
      this.categories.map(async (category) => {
        const score = await this.calculateCategoryScore(userId, category);
        const factors = await this.identifyRiskFactors(userId, category);
        return {
          name: category,
          score,
          factors
        };
      })
    );
  }

  private async calculateCategoryScore(userId: number, category: string): Promise<number> {
    let score = 70; // Base score

    switch (category) {
      case 'authentication':
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        if (user[0].failedAttempts > 0) {
          score -= user[0].failedAttempts * 5;
        }
        break;

      case 'threat_interaction':
        const threats = await db
          .select()
          .from(threats)
          .where(eq(threats.sharedBy, userId));
        
        // More threat awareness and sharing improves score
        score += Math.min(threats.length * 2, 20);
        break;

      // Add more category-specific calculations
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateOverallScore(categories: RiskCategory[]): number {
    const weights: Record<string, number> = {
      authentication: 0.3,
      access_patterns: 0.2,
      threat_interaction: 0.2,
      system_usage: 0.15,
      security_awareness: 0.15
    };

    return categories.reduce((total, category) => {
      return total + (category.score * (weights[category.name] || 0.1));
    }, 0);
  }

  private async generateRecommendations(categories: RiskCategory[]): Promise<string[]> {
    const recommendations: string[] = [];

    for (const category of categories) {
      if (category.score < 50) {
        recommendations.push(...this.getRecommendationsForCategory(category));
      }
    }

    return recommendations;
  }

  private getRecommendationsForCategory(category: RiskCategory): string[] {
    const recommendationMap: Record<string, string[]> = {
      authentication: [
        "Enable two-factor authentication",
        "Use a password manager",
        "Change passwords regularly",
        "Avoid using similar passwords across accounts"
      ],
      access_patterns: [
        "Review and update access permissions regularly",
        "Implement the principle of least privilege",
        "Use VPN when accessing sensitive resources"
      ],
      threat_interaction: [
        "Participate in threat intelligence sharing",
        "Stay updated with latest security advisories",
        "Report suspicious activities promptly"
      ],
      system_usage: [
        "Keep systems and software up to date",
        "Use endpoint protection solutions",
        "Regular security audits"
      ],
      security_awareness: [
        "Complete security awareness training",
        "Stay informed about latest security trends",
        "Practice security hygiene"
      ]
    };

    return recommendationMap[category.name] || [];
  }

  private identifyVulnerabilitiesAndStrengths(categories: RiskCategory[]): {
    vulnerabilities: string[];
    strengths: string[];
  } {
    const vulnerabilities: string[] = [];
    const strengths: string[] = [];

    categories.forEach(category => {
      if (category.score < 50) {
        vulnerabilities.push(`Low ${category.name} score (${category.score})`);
      } else if (category.score >= 80) {
        strengths.push(`Strong ${category.name} practices (${category.score})`);
      }
    });

    return { vulnerabilities, strengths };
  }

  private async saveRiskProfile(userId: number, profile: RiskProfile): Promise<void> {
    const [existingProfile] = await db
      .select()
      .from(riskProfiles)
      .where(eq(riskProfiles.userId, userId))
      .limit(1);

    const historicalScores = existingProfile
      ? [...(existingProfile.historicalScores as any[] || []), {
          date: new Date().toISOString(),
          score: profile.overallScore
        }]
      : [{
          date: new Date().toISOString(),
          score: profile.overallScore
        }];

    const profileData = {
      userId,
      overallScore: profile.overallScore,
      categories: profile.categories,
      recommendations: profile.recommendations,
      vulnerabilities: profile.vulnerabilities,
      strengths: profile.strengths,
      historicalScores,
      lastUpdated: new Date(),
      nextAssessmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next assessment in 7 days
    };

    if (existingProfile) {
      await db
        .update(riskProfiles)
        .set(profileData)
        .where(eq(riskProfiles.id, existingProfile.id));
    } else {
      await db.insert(riskProfiles).values(profileData);
    }
  }
}

export const riskProfileService = RiskProfileService.getInstance();
