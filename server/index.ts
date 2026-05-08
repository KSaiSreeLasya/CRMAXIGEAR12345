import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { handleDemo } from "./routes/demo";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Serve React frontend
  const staticPath = path.join(__dirname, "../dist/client");
  app.use(express.static(staticPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get(/.*/, (_req, res) => {
    const indexPath = path.join(__dirname, "../dist/client/index.html");
    if (existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      // In development, let Vite handle the SPA routing
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>AXIGEAR CRM</title>
          </head>
          <body>
            <div id="root"></div>
            <script type="module" src="/client/main.tsx"></script>
          </body>
        </html>
      `);
    }
  });

  return app;
}
