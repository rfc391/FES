import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Basic user schema with authentication fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  riskScore: real("risk_score").default(0).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  failedAttempts: integer("failed_attempts").default(0).notNull(),
  status: text("status").default("active").notNull(),
});

export const riskProfiles = pgTable("risk_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  overallScore: real("overall_score").default(0).notNull(),
  categories: json("categories").notNull(), // Stores scores for different security categories
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  recommendations: json("recommendations"), // Stores personalized security recommendations
  historicalScores: json("historical_scores"), // Tracks score changes over time
  vulnerabilities: json("vulnerabilities"), // Identified security vulnerabilities
  strengths: json("strengths"), // Identified security strengths
  nextAssessmentDate: timestamp("next_assessment_date"),
});

export const threats = pgTable("threats", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  severity: text("severity").notNull(),
  source: text("source").notNull(),
  targetIp: text("target_ip"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  details: json("details").notNull(),
  status: text("status").default("active").notNull(),
  resolutionNotes: text("resolution_notes"),
  isShared: boolean("is_shared").default(false),
  sharedBy: integer("shared_by").references(() => users.id),
  organizationName: text("organization_name"),
  indicators: json("indicators"),
  mitigation: text("mitigation"),
  confidence: real("confidence").default(0.5),
});

export const threatIntelligence = pgTable("threat_intelligence", {
  id: serial("id").primaryKey(),
  threatId: integer("threat_id").references(() => threats.id),
  sharedBy: integer("shared_by").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  insights: text("insights").notNull(),
  tags: json("tags"),
  relatedThreats: json("related_threats"),
  confidenceScore: real("confidence_score").default(0.7),
  verifiedBy: json("verified_by"),
  refLinks: json("ref_links"),
});

// Schema validation
export const insertUserSchema = createInsertSchema(users, {
  password: (schema) => schema.password,
  username: (schema) => schema.username,
});
export const selectUserSchema = createSelectSchema(users);
export const insertThreatSchema = createInsertSchema(threats);
export const selectThreatSchema = createSelectSchema(threats);
export const insertThreatIntelligenceSchema = createInsertSchema(threatIntelligence);
export const selectThreatIntelligenceSchema = createSelectSchema(threatIntelligence);
export const insertRiskProfileSchema = createInsertSchema(riskProfiles);
export const selectRiskProfileSchema = createSelectSchema(riskProfiles);

// Types
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertThreat = typeof threats.$inferInsert;
export type SelectThreat = typeof threats.$inferSelect;
export type InsertThreatIntelligence = typeof threatIntelligence.$inferInsert;
export type SelectThreatIntelligence = typeof threatIntelligence.$inferSelect;
export type InsertRiskProfile = typeof riskProfiles.$inferInsert;
export type SelectRiskProfile = typeof riskProfiles.$inferSelect;