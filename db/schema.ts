import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  riskScore: integer("risk_score").default(0).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  status: text("status").default("active").notNull(),
});

export const loginAttempts = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  successful: boolean("successful").notNull(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  riskFactors: jsonb("risk_factors"),
  score: integer("score").default(0).notNull(),
});

export const riskFactors = pgTable("risk_factors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(),
  severity: text("severity").notNull(),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
  details: jsonb("details"),
  resolved: boolean("resolved").default(false).notNull(),
});

// Define relationships
export const userRelations = relations(users, ({ many }) => ({
  loginAttempts: many(loginAttempts),
  riskFactors: many(riskFactors),
}));

export const loginAttemptsRelations = relations(loginAttempts, ({ one }) => ({
  user: one(users, {
    fields: [loginAttempts.userId],
    references: [users.id],
  }),
}));

export const riskFactorsRelations = relations(riskFactors, ({ one }) => ({
  user: one(users, {
    fields: [riskFactors.userId],
    references: [users.id],
  }),
}));

// Create Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertLoginAttemptSchema = createInsertSchema(loginAttempts);
export const selectLoginAttemptSchema = createSelectSchema(loginAttempts);

export const insertRiskFactorSchema = createInsertSchema(riskFactors);
export const selectRiskFactorSchema = createSelectSchema(riskFactors);

// TypeScript types
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertLoginAttempt = typeof loginAttempts.$inferInsert;
export type SelectLoginAttempt = typeof loginAttempts.$inferSelect;

export type InsertRiskFactor = typeof riskFactors.$inferInsert;
export type SelectRiskFactor = typeof riskFactors.$inferSelect;