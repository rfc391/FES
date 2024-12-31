import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { db } from "@db";
import { setupAuth } from "./auth";
import { threats } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { threatPredictor } from "./ml/threatPredictor";

export function registerRoutes(app: Express): Server {
  // Setup authentication first
  setupAuth(app);

  // Get threat predictions
  app.get('/api/threats/predictions', async (req, res) => {
    try {
      const predictions = await threatPredictor.getPredictions();
      res.json(predictions);
    } catch (error) {
      console.error('Error getting threat predictions:', error);
      res.status(500).json({ error: 'Failed to get threat predictions' });
    }
  });

  // Get latest threats
  app.get('/api/threats', async (req, res) => {
    try {
      const latestThreats = await db
        .select()
        .from(threats)
        .orderBy(desc(threats.timestamp))
        .limit(50);
      res.json(latestThreats);
    } catch (error) {
      console.error('Error fetching threats:', error);
      res.status(500).json({ error: 'Failed to fetch threats' });
    }
  });

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/api/threats" });

  // WebSocket connection handler for real-time threat updates
  wss.on("connection", (ws) => {
    console.log("Client connected to threat feed");

    // Send initial threat data
    db.select()
      .from(threats)
      .orderBy(desc(threats.timestamp))
      .limit(10)
      .then((initialThreats) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'initial', threats: initialThreats }));
        }
      })
      .catch(console.error);

    ws.on("close", () => {
      console.log("Client disconnected from threat feed");
    });
  });

  return httpServer;
}