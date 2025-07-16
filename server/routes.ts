import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";

// Local schema definitions for server-side validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });

  // Authentication - Dummy login for testing only
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Dummy users for testing
      const dummyUsers = {
        "admin@company.com": {
          id: 1,
          email: "admin@company.com",
          username: "admin",
          role: "super-admin" as const,
          password: "password123"
        },
        "manager@company.com": {
          id: 2,
          email: "manager@company.com",
          username: "manager", 
          role: "manager" as const,
          password: "password123"
        },
        "staff@company.com": {
          id: 3,
          email: "staff@company.com",
          username: "staff",
          role: "admin" as const,
          password: "password123"
        }
      };
      
      const user = dummyUsers[email as keyof typeof dummyUsers];
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        user: userWithoutPassword,
        token: "dummy-token-123"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // All other endpoints return dummy data - app is completely client-side
  app.get("/api/*", (req, res) => {
    res.json({ message: "This app uses local data only", data: [] });
  });

  app.post("/api/*", (req, res) => {
    res.json({ message: "This app uses local data only", success: true });
  });

  app.put("/api/*", (req, res) => {
    res.json({ message: "This app uses local data only", success: true });
  });

  app.delete("/api/*", (req, res) => {
    res.json({ message: "This app uses local data only", success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
