import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  riskScore: real("risk_score").default(0).notNull(),
  lastLogin: timestamp("last_login"),
  failedAttempts: integer("failed_attempts").default(0),
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

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  threatId: integer("threat_id").references(() => threats.id),
  userId: integer("user_id").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  message: text("message").notNull(),
  acknowledged: boolean("acknowledged").default(false),
  priority: text("priority").notNull(),
});

export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metricType: text("metric_type").notNull(),
  value: real("value").notNull(),
  metadata: json("metadata"),
});

export const riskFactors = pgTable("risk_factors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  factorType: text("factor_type").notNull(),
  severity: real("severity").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  details: json("details"),
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
  references: json("references"),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertThreatSchema = createInsertSchema(threats);
export const selectThreatSchema = createSelectSchema(threats);
export const insertAlertSchema = createInsertSchema(alerts);
export const selectAlertSchema = createSelectSchema(alerts);
export const insertMetricSchema = createInsertSchema(metrics);
export const selectMetricSchema = createSelectSchema(metrics);
export const insertRiskFactorSchema = createInsertSchema(riskFactors);
export const selectRiskFactorSchema = createSelectSchema(riskFactors);
export const insertThreatIntelligenceSchema = createInsertSchema(threatIntelligence);
export const selectThreatIntelligenceSchema = createSelectSchema(threatIntelligence);

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertThreat = typeof threats.$inferInsert;
export type SelectThreat = typeof threats.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;
export type SelectAlert = typeof alerts.$inferSelect;
export type InsertMetric = typeof metrics.$inferInsert;
export type SelectMetric = typeof metrics.$inferSelect;
export type InsertRiskFactor = typeof riskFactors.$inferInsert;
export type SelectRiskFactor = typeof riskFactors.$inferSelect;
export type InsertThreatIntelligence = typeof threatIntelligence.$inferInsert;
export type SelectThreatIntelligence = typeof threatIntelligence.$inferSelect;