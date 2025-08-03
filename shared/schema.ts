import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("manager"), // super-admin, admin, manager
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customers table - Enhanced with plan activation details
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  location: text("location").notNull(),
  serviceProvider: text("service_provider"),
  planId: integer("plan_id"),
  planName: text("plan_name"),
  activationDate: timestamp("activation_date"),
  expirationDate: timestamp("expiration_date"),
  balanceDue: integer("balance_due").default(0),
  staticIp: text("static_ip"),
  macAddress: text("mac_address"),
  status: text("status").default("active"), // active, suspended, expired, pending
  area: text("area"), // rural, urban
  mode: text("mode").default("online"), // online, offline
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Engineers table
export const engineers = pgTable("engineers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  location: text("location").notNull(),
  specialization: text("specialization").notNull(),
  rating: integer("rating").default(0),
  completedJobs: integer("completed_jobs").default(0),
  activeJobs: integer("active_jobs").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service Plans table
export const servicePlans = pgTable("service_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(), // jio, airtel, bsnl, my-internet
  speed: text("speed").notNull(),
  price: integer("price").notNull(),
  validity: integer("validity").notNull(), // in days
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Complaints table
export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("medium"), // urgent, high, medium, low
  status: text("status").notNull().default("pending"), // pending, assigned, in-progress, visited, resolved, not-resolved
  engineerId: integer("engineer_id"),
  location: text("location").notNull(),
  attachments: jsonb("attachments"),
  resolution: text("resolution"),
  rating: integer("rating"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // all-users, all-engineers, specific-user, location-based
  priority: text("priority").notNull().default("normal"), // normal, high, urgent
  recipientType: text("recipient_type").notNull(),
  recipients: jsonb("recipients"), // array of user IDs or criteria
  sentBy: integer("sent_by").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  deliveredCount: integer("delivered_count").default(0),
  readCount: integer("read_count").default(0),
});

// Support Tickets table
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  status: text("status").notNull().default("open"), // open, in-progress, resolved, closed
  category: text("category").notNull().default("technical"), // technical, billing, general, complaint
  assignedTo: integer("assigned_to"),
  response: text("response"),
  rating: integer("rating"), // 1-5 stars
  feedback: text("feedback"),
  tags: jsonb("tags"), // array of tags
  attachments: jsonb("attachments"), // array of file URLs
  slaBreached: boolean("sla_breached").default(false),
  escalated: boolean("escalated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Analytics & Metrics table
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  metricType: text("metric_type").notNull(), // complaints, revenue, performance, network
  metricName: text("metric_name").notNull(),
  value: integer("value").notNull(),
  period: text("period").notNull(), // daily, weekly, monthly, yearly
  location: text("location"),
  category: text("category"),
  metadata: jsonb("metadata"), // additional data
  createdAt: timestamp("created_at").defaultNow(),
});

// System Settings table
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // general, sla, notifications, security, etc.
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedBy: integer("updated_by").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit Logs table
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(), // create, update, delete, login, logout
  entityType: text("entity_type").notNull(), // user, customer, complaint, etc.
  entityId: integer("entity_id"),
  changes: jsonb("changes"), // what changed
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// New Installation Requests table
export const newInstallations = pgTable("new_installations", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  location: text("location").notNull(),
  preferredPlan: text("preferred_plan"),
  planId: integer("plan_id"),
  requestType: text("request_type").notNull().default("residential"), // residential, commercial
  status: text("status").notNull().default("pending"), // pending, confirmed, rejected, installed
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  estimatedCost: integer("estimated_cost"),
  notes: text("notes"),
  assignedEngineerId: integer("assigned_engineer_id"),
  scheduledDate: timestamp("scheduled_date"),
  installationDate: timestamp("installation_date"),
  rejectionReason: text("rejection_reason"),
  documents: jsonb("documents"), // array of document URLs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leads table for inquiries and prospects
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  location: text("location"),
  source: text("source").notNull().default("website"), // website, ivr, whatsapp, referral, social_media
  inquiryType: text("inquiry_type").notNull().default("general"), // general, pricing, technical, support
  message: text("message"),
  status: text("status").notNull().default("new"), // new, contacted, qualified, converted, closed
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  isContactedByManager: boolean("is_contacted_by_manager").default(false),
  assignedTo: integer("assigned_to"), // user id of assigned agent/manager
  followUpDate: timestamp("follow_up_date"),
  lastContactDate: timestamp("last_contact_date"),
  conversionProbability: integer("conversion_probability").default(0), // 0-100%
  estimatedValue: integer("estimated_value"),
  tags: jsonb("tags"), // array of tags
  notes: text("notes"),
  leadScore: integer("lead_score").default(0), // calculated lead scoring
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertEngineerSchema = createInsertSchema(engineers).omit({
  id: true,
  createdAt: true,
});

export const insertServicePlanSchema = createInsertSchema(servicePlans).omit({
  id: true,
  createdAt: true,
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  sentAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertNewInstallationSchema = createInsertSchema(newInstallations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// IPTV Plans Schema
export const iptvPlans = pgTable("iptv_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  totalChannels: integer("total_channels").notNull(),
  payChannels: integer("pay_channels").notNull(),
  freeToAirChannels: integer("free_to_air_channels").notNull(),
  price: integer("price").notNull(),
  lcoMarginPercent: integer("lco_margin_percent").notNull(),
  distributorMarginPercent: integer("distributor_margin_percent").notNull(),
  channelList: jsonb("channel_list"),
  planType: text("plan_type").notNull(), // lite, standard, premium
  quality: text("quality").notNull(), // HD, 4K, SD
  provider: text("provider").notNull(),
  logo: text("logo"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OTT Plans Schema
export const ottPlans = pgTable("ott_plans", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  price: integer("price").notNull(),
  speedBeforeLimit: text("speed_before_limit").notNull(),
  speedAfterLimit: text("speed_after_limit").notNull(),
  dataLimitGB: integer("data_limit_gb"),
  isUnlimited: boolean("is_unlimited").default(false),
  validity: text("validity").notNull(),
  ottApps: jsonb("ott_apps"),
  callBenefit: text("call_benefit"),
  provider: text("provider").notNull(),
  logo: text("logo"),
  description: text("description"),
  planType: text("plan_type").default("ott"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fibre Plans Schema
export const fibrePlans = pgTable("fibre_plans", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  price: integer("price").notNull(),
  validity: text("validity").notNull(),
  speed: text("speed").notNull(),
  dataLimit: text("data_limit").notNull(),
  provider: text("provider").notNull(),
  logo: text("logo"),
  benefits: text("benefits"),
  description: text("description"),
  planType: text("plan_type").notNull(), // Basic, Standard, Premium
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for service plans
export const insertIptvPlanSchema = createInsertSchema(iptvPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOttPlanSchema = createInsertSchema(ottPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFibrePlanSchema = createInsertSchema(fibrePlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Auth schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["super-admin", "admin", "manager"]),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Engineer = typeof engineers.$inferSelect;
export type InsertEngineer = z.infer<typeof insertEngineerSchema>;
export type ServicePlan = typeof servicePlans.$inferSelect;
export type InsertServicePlan = z.infer<typeof insertServicePlanSchema>;
export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type NewInstallation = typeof newInstallations.$inferSelect;
export type InsertNewInstallation = z.infer<typeof insertNewInstallationSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type IptvPlan = typeof iptvPlans.$inferSelect;
export type InsertIptvPlan = z.infer<typeof insertIptvPlanSchema>;
export type OttPlan = typeof ottPlans.$inferSelect;
export type InsertOttPlan = z.infer<typeof insertOttPlanSchema>;
export type FibrePlan = typeof fibrePlans.$inferSelect;
export type InsertFibrePlan = z.infer<typeof insertFibrePlanSchema>;
export type LoginData = z.infer<typeof loginSchema>;

// Additional validation schemas for API endpoints
export const createComplaintSchema = insertComplaintSchema.extend({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["urgent", "high", "medium", "low"]),
  location: z.string().min(1, "Location is required"),
});

export const updateComplaintSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(10).optional(),
  priority: z.enum(["urgent", "high", "medium", "low"]).optional(),
  status: z.enum(["pending", "assigned", "in-progress", "visited", "resolved", "not-resolved"]).optional(),
  engineerId: z.number().optional(),
  resolution: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  feedback: z.string().optional(),
});

export const createEngineerSchema = insertEngineerSchema.extend({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  location: z.string().min(1, "Location is required"),
  specialization: z.enum(["Network", "Hardware", "Software", "Installation", "Maintenance"]),
});

export const createSupportTicketSchema = insertSupportTicketSchema.extend({
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.enum(["technical", "billing", "general", "complaint"]),
});

// Dashboard statistics schema
export const dashboardStatsSchema = z.object({
  totalComplaints: z.number(),
  activeComplaints: z.number(),
  resolvedToday: z.number(),
  avgResolutionTime: z.number(),
  totalEngineers: z.number(),
  activeEngineers: z.number(),
  totalCustomers: z.number(),
  networkUptime: z.number(),
  customerSatisfaction: z.number(),
  monthlyRevenue: z.number(),
});

// Additional validation schemas for New Installation and Leads
export const createNewInstallationSchema = insertNewInstallationSchema.extend({
  customerName: z.string().min(1, "Customer name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(1, "Address is required"),
  location: z.string().min(1, "Location is required"),
  status: z.enum(["pending", "confirmed", "rejected", "installed"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

export const updateNewInstallationSchema = z.object({
  status: z.enum(["pending", "confirmed", "rejected", "installed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assignedEngineerId: z.number().optional(),
  scheduledDate: z.date().optional(),
  installationDate: z.date().optional(),
  rejectionReason: z.string().optional(),
  notes: z.string().optional(),
  estimatedCost: z.number().optional(),
});

export const createLeadSchema = insertLeadSchema.extend({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  source: z.enum(["website", "ivr", "whatsapp", "referral", "social_media"]),
  inquiryType: z.enum(["general", "pricing", "technical", "support"]),
  status: z.enum(["new", "contacted", "qualified", "converted", "closed"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

export const updateLeadSchema = z.object({
  status: z.enum(["new", "contacted", "qualified", "converted", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  isContactedByManager: z.boolean().optional(),
  assignedTo: z.number().optional(),
  followUpDate: z.date().optional(),
  lastContactDate: z.date().optional(),
  conversionProbability: z.number().min(0).max(100).optional(),
  estimatedValue: z.number().optional(),
  notes: z.string().optional(),
  leadScore: z.number().min(0).max(100).optional(),
});

export type CreateComplaint = z.infer<typeof createComplaintSchema>;
export type UpdateComplaint = z.infer<typeof updateComplaintSchema>;
export type CreateEngineer = z.infer<typeof createEngineerSchema>;
export type CreateSupportTicket = z.infer<typeof createSupportTicketSchema>;
export type CreateNewInstallation = z.infer<typeof createNewInstallationSchema>;
export type UpdateNewInstallation = z.infer<typeof updateNewInstallationSchema>;
export type CreateLead = z.infer<typeof createLeadSchema>;
export type UpdateLead = z.infer<typeof updateLeadSchema>;
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
