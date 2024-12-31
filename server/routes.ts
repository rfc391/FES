
import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { db } from "@db";
import { setupAuth } from "./auth";
import { threats } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { threatPredictor } from "./ml/threatPredictor";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // API Routes
  app.get('/api/threats/predictions', async (req, res) => {
    try {
      const predictions = await threatPredictor.getPredictions();
      res.json(predictions);
    } catch (error) {
      console.error('Error getting threat predictions:', error);
      res.status(500).json({ error: 'Failed to get threat predictions' });
    }
  });

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

  // WebSocket Setup
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/api/threats" });

  wss.on("connection", handleWebSocketConnection);

  return httpServer;
}

function handleWebSocketConnection(ws: WebSocket): void {
  console.log("Client connected to threat feed");

  sendInitialThreats(ws);

  ws.on("close", () => {
    console.log("Client disconnected from threat feed");
  });
}

async function sendInitialThreats(ws: WebSocket): Promise<void> {
  try {
    const initialThreats = await db
      .select()
      .from(threats)
      .orderBy(desc(threats.timestamp))
      .limit(10);

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'initial', threats: initialThreats }));
    }
  } catch (error) {
    console.error('Error sending initial threats:', error);
  }
}
