import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple logging middleware for any requests
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

(async () => {
  // Completely client-side app - no API routes needed
  // All data is handled with dummy data in the frontend
  
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  const port = parseInt(process.env.PORT || '5000', 10);
  const server = app.listen(port, HOST, () => {
    log(`WiFi Self-Care Platform serving on port ${port}`);
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
})();
