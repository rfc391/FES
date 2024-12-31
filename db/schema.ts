import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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

export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  emailEnabled: boolean("email_enabled").default(true),
  webhookEnabled: boolean("webhook_enabled").default(false),
  inAppEnabled: boolean("in_app_enabled").default(true),
  emailAddress: text("email_address"),
  webhookUrl: text("webhook_url"),
  minimumSeverity: text("minimum_severity").default("medium"),
  digestFrequency: text("digest_frequency").default("realtime"),
  quietHoursStart: integer("quiet_hours_start"),
  quietHoursEnd: integer("quiet_hours_end"),
  customFilters: json("custom_filters"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const securityRecommendations = pgTable("security_recommendations", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  impact: text("impact").notNull(),
  currentState: json("current_state"),
  recommendedState: json("recommended_state"),
  priority: text("priority").default("medium").notNull(),
  implementationSteps: json("implementation_steps"),
  appliedAt: timestamp("applied_at"),
  appliedBy: integer("applied_by").references(() => users.id),
  isApplicable: boolean("is_applicable").default(true),
  autoApply: boolean("auto_apply").default(false),
  verificationSteps: json("verification_steps"),
});

export const socialPosts = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  likes: integer("likes").default(0),
  tags: json("tags").$type<string[]>().default([]),
});

export const socialComments = pgTable("social_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => socialPosts.id),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const socialConnections = pgTable("social_connections", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").references(() => users.id),
  followingId: integer("following_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const socialLikes = pgTable("social_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => socialPosts.id),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(socialPosts),
  comments: many(socialComments),
  likes: many(socialLikes),
  following: many(socialConnections, { relationName: "following" }),
  followers: many(socialConnections, { relationName: "followers" }),
}));

export const socialPostsRelations = relations(socialPosts, ({ one, many }) => ({
  user: one(users, { fields: [socialPosts.userId], references: [users.id] }),
  comments: many(socialComments),
  likes: many(socialLikes),
}));

export const socialCommentsRelations = relations(socialComments, ({ one }) => ({
  user: one(users, { fields: [socialComments.userId], references: [users.id] }),
  post: one(socialPosts, { fields: [socialComments.postId], references: [socialPosts.id] }),
}));

export const socialLikesRelations = relations(socialLikes, ({ one }) => ({
  user: one(users, { fields: [socialLikes.userId], references: [users.id] }),
  post: one(socialPosts, { fields: [socialLikes.postId], references: [socialPosts.id] }),
}));

export const socialConnectionsRelations = relations(socialConnections, ({ one }) => ({
  follower: one(users, { fields: [socialConnections.followerId], references: [users.id] }),
  following: one(users, { fields: [socialConnections.followingId], references: [users.id] }),
}));

export const insertUserSchema = createInsertSchema(users, {
  password: (schema) => schema.password,
  username: (schema) => schema.username,
});

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
export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences);
export const selectNotificationPreferencesSchema = createSelectSchema(notificationPreferences);
export const insertSecurityRecommendationSchema = createInsertSchema(securityRecommendations);
export const selectSecurityRecommendationSchema = createSelectSchema(securityRecommendations);
export const insertSocialPostSchema = createInsertSchema(socialPosts);
export const selectSocialPostSchema = createSelectSchema(socialPosts);
export const insertSocialCommentSchema = createInsertSchema(socialComments);
export const selectSocialCommentSchema = createSelectSchema(socialComments);
export const insertSocialConnectionSchema = createInsertSchema(socialConnections);
export const selectSocialConnectionSchema = createSelectSchema(socialConnections);
export const insertSocialLikeSchema = createInsertSchema(socialLikes);
export const selectSocialLikeSchema = createSelectSchema(socialLikes);

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
export type InsertNotificationPreferences = typeof notificationPreferences.$inferInsert;
export type SelectNotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertSecurityRecommendation = typeof securityRecommendations.$inferInsert;
export type SelectSecurityRecommendation = typeof securityRecommendations.$inferSelect;
export type InsertSocialPost = typeof socialPosts.$inferInsert;
export type SelectSocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialComment = typeof socialComments.$inferInsert;
export type SelectSocialComment = typeof socialComments.$inferSelect;
export type InsertSocialConnection = typeof socialConnections.$inferInsert;
export type SelectSocialConnection = typeof socialConnections.$inferSelect;
export type InsertSocialLike = typeof socialLikes.$inferInsert;
export type SelectSocialLike = typeof socialLikes.$inferSelect;