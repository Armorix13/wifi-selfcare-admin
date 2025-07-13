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
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("open"), // open, in-progress, resolved, closed
  assignedTo: integer("assigned_to"),
  response: text("response"),
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
export type LoginData = z.infer<typeof loginSchema>;
