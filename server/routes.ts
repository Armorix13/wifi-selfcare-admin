import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema,
  insertCustomerSchema,
  insertEngineerSchema,
  insertServicePlanSchema,
  insertComplaintSchema,
  insertNotificationSchema,
  insertSupportTicketSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, role } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password || user.role !== role) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In real app, generate JWT token
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          username: user.username, 
          role: user.role 
        },
        token: "mock-jwt-token"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password from response for security
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.createUser(userData);
      // Remove password from response for security
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const user = await storage.updateUser(id, updateData);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response for security
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const complaintStats = await storage.getComplaintStats();
      const engineers = await storage.getAllEngineers();
      const activeEngineers = engineers.filter(e => e.isActive).length;
      
      res.json({
        totalComplaints: complaintStats.total,
        resolvedIssues: complaintStats.resolved,
        avgResolutionTime: complaintStats.avgResolutionTime,
        activeEngineers,
        complaintStats
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Customers
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, updateData);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  // Engineers
  app.get("/api/engineers", async (req, res) => {
    try {
      const engineers = await storage.getAllEngineers();
      res.json(engineers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch engineers" });
    }
  });

  app.post("/api/engineers", async (req, res) => {
    try {
      const engineerData = insertEngineerSchema.parse(req.body);
      const engineer = await storage.createEngineer(engineerData);
      res.status(201).json(engineer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create engineer" });
    }
  });

  app.put("/api/engineers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertEngineerSchema.partial().parse(req.body);
      const engineer = await storage.updateEngineer(id, updateData);
      
      if (!engineer) {
        return res.status(404).json({ message: "Engineer not found" });
      }
      
      res.json(engineer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update engineer" });
    }
  });

  app.delete("/api/engineers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEngineer(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Engineer not found" });
      }
      
      res.json({ message: "Engineer deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete engineer" });
    }
  });

  // Service Plans
  app.get("/api/service-plans", async (req, res) => {
    try {
      const plans = await storage.getAllServicePlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service plans" });
    }
  });

  app.post("/api/service-plans", async (req, res) => {
    try {
      const planData = insertServicePlanSchema.parse(req.body);
      const plan = await storage.createServicePlan(planData);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service plan" });
    }
  });

  app.put("/api/service-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertServicePlanSchema.partial().parse(req.body);
      const plan = await storage.updateServicePlan(id, updateData);
      
      if (!plan) {
        return res.status(404).json({ message: "Service plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update service plan" });
    }
  });

  app.delete("/api/service-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteServicePlan(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Service plan not found" });
      }
      
      res.json({ message: "Service plan deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service plan" });
    }
  });

  // Complaints
  app.get("/api/complaints", async (req, res) => {
    try {
      const { status, location, engineerId } = req.query;
      let complaints = await storage.getAllComplaints();
      
      if (status) {
        complaints = complaints.filter(c => c.status === status);
      }
      if (location) {
        complaints = complaints.filter(c => c.location === location);
      }
      if (engineerId) {
        complaints = complaints.filter(c => c.engineerId === parseInt(engineerId as string));
      }
      
      // Get customer and engineer details for each complaint
      const complaintsWithDetails = await Promise.all(
        complaints.map(async (complaint) => {
          const customer = await storage.getCustomer(complaint.customerId);
          const engineer = complaint.engineerId ? await storage.getEngineer(complaint.engineerId) : null;
          return {
            ...complaint,
            customer,
            engineer,
          };
        })
      );
      
      res.json(complaintsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch complaints" });
    }
  });

  app.post("/api/complaints", async (req, res) => {
    try {
      const complaintData = insertComplaintSchema.parse(req.body);
      const complaint = await storage.createComplaint(complaintData);
      res.status(201).json(complaint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create complaint" });
    }
  });

  app.put("/api/complaints/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertComplaintSchema.partial().parse(req.body);
      
      // If status is being updated to resolved, set resolvedAt
      if (updateData.status === "resolved") {
        updateData.resolvedAt = new Date();
      }
      
      const complaint = await storage.updateComplaint(id, updateData);
      
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      
      res.json(complaint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update complaint" });
    }
  });

  app.delete("/api/complaints/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteComplaint(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      
      res.json({ message: "Complaint deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete complaint" });
    }
  });

  // Notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = await storage.getAllNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  // Support Tickets
  app.get("/api/support-tickets", async (req, res) => {
    try {
      const tickets = await storage.getAllSupportTickets();
      
      // Get customer details for each ticket
      const ticketsWithDetails = await Promise.all(
        tickets.map(async (ticket) => {
          const customer = await storage.getCustomer(ticket.customerId);
          return {
            ...ticket,
            customer,
          };
        })
      );
      
      res.json(ticketsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.post("/api/support-tickets", async (req, res) => {
    try {
      const ticketData = insertSupportTicketSchema.parse(req.body);
      const ticket = await storage.createSupportTicket(ticketData);
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  app.put("/api/support-tickets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertSupportTicketSchema.partial().parse(req.body);
      const ticket = await storage.updateSupportTicket(id, updateData);
      
      if (!ticket) {
        return res.status(404).json({ message: "Support ticket not found" });
      }
      
      res.json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update support ticket" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
