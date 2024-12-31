import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { createProxyMiddleware } from 'http-proxy-middleware';
import { db } from "@db";
import { setupAuth } from "./auth";
import { users, threats, alerts, metrics } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Setup authentication first
  setupAuth(app);

  // Proxy /api/process-signal requests to Python backend
  app.use('/api/process-signal', createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
    pathRewrite: {
      '^/api/process-signal': '/api/process-signal'
    },
    onProxyError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.writeHead(500, {
        'Content-Type': 'text/plain',
      });
      res.end('Proxy error occurred');
    }
  }));

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

  // Get alerts for a user
  app.get('/api/alerts', async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const userAlerts = await db
        .select()
        .from(alerts)
        .where(eq(alerts.userId, req.user.id))
        .orderBy(desc(alerts.timestamp))
        .limit(20);
      res.json(userAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  // Acknowledge an alert
  app.post('/api/alerts/:id/acknowledge', async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const [updatedAlert] = await db
        .update(alerts)
        .set({ acknowledged: true })
        .where(eq(alerts.id, parseInt(req.params.id)))
        .returning();
      res.json(updatedAlert);
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      res.status(500).json({ error: 'Failed to acknowledge alert' });
    }
  });

  // Get system metrics
  app.get('/api/metrics', async (req, res) => {
    try {
      const systemMetrics = await db
        .select()
        .from(metrics)
        .orderBy(desc(metrics.timestamp))
        .limit(100);
      res.json(systemMetrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/api/threats" });

  // WebSocket connection handler
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

    // Simulate threat data (in production, this would be real threat detection)
    const interval = setInterval(() => {
      const threat = {
        type: ["Malware", "DDoS", "Data Breach", "Phishing"][Math.floor(Math.random() * 4)],
        severity: Math.random() > 0.7 ? "high" : "medium",
        source: ["US", "CN", "RU", "UK", "DE"][Math.floor(Math.random() * 5)],
        targetIp: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
        details: {
          attackVector: ["Email", "Web", "Network", "USB"][Math.floor(Math.random() * 4)],
          indicators: ["Suspicious traffic", "Unusual login pattern", "Data exfiltration"][Math.floor(Math.random() * 3)],
          timestamp: new Date().toISOString()
        }
      };

      // Store threat in database
      db.insert(threats)
        .values(threat)
        .returning()
        .then(([newThreat]) => {
          // Broadcast to all clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'update', threat: newThreat }));
            }
          });

          // Create alert if severity is high
          if (threat.severity === 'high') {
            db.insert(alerts)
              .values({
                threatId: newThreat.id,
                message: `High severity ${threat.type} threat detected from ${threat.source}`,
                priority: 'high'
              })
              .then(() => console.log('Alert created for high severity threat'))
              .catch(console.error);
          }
        })
        .catch(console.error);
    }, 5000);

    ws.on("close", () => {
      clearInterval(interval);
      console.log("Client disconnected from threat feed");
    });
  });

  return httpServer;
}