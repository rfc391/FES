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
  type: text("type").notNull(), // e.g., "malware", "intrusion", "ddos"
  severity: text("severity").notNull(), // "low", "medium", "high", "critical"
  source: text("source").notNull(),
  targetIp: text("target_ip"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  details: json("details").notNull(),
  status: text("status").default("active").notNull(), // "active", "resolved", "false_positive"
  resolutionNotes: text("resolution_notes"),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  threatId: integer("threat_id").references(() => threats.id),
  userId: integer("user_id").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  message: text("message").notNull(),
  acknowledged: boolean("acknowledged").default(false),
  priority: text("priority").notNull(), // "low", "medium", "high", "critical"
});

export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metricType: text("metric_type").notNull(), // "system_health", "network_traffic", "threat_count"
  value: real("value").notNull(),
  metadata: json("metadata"),
});

export const riskFactors = pgTable("risk_factors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  factorType: text("factor_type").notNull(), // "login_pattern", "access_attempt", "location_change"
  severity: real("severity").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  details: json("details"),
});

// Export schemas for validation
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

// Export types
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