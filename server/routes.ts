import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { WebSocket, WebSocketServer } from "ws";
import { createProxyMiddleware } from 'http-proxy-middleware';

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Proxy /api/process-signal requests to Python backend
  app.use('/api/process-signal', createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
    pathRewrite: {
      '^/api/process-signal': '/api/process-signal'
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).send('Proxy error occurred');
    }
  }));

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/api/threats" });

  wss.on("connection", (ws) => {
    console.log("Client connected to threat feed");

    // Simulate threat data
    const interval = setInterval(() => {
      const threat = {
        id: Math.random().toString(36).substr(2, 9),
        type: ["Malware", "DDoS", "Data Breach", "Phishing"][Math.floor(Math.random() * 4)],
        severity: Math.random() > 0.7 ? "high" : "medium",
        location: ["US", "CN", "RU", "UK", "DE"][Math.floor(Math.random() * 5)],
        latitude: (Math.random() * 180) - 90,
        longitude: (Math.random() * 360) - 180,
        timestamp: new Date().toISOString()
      };

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(threat));
      }
    }, 2000);

    ws.on("close", () => {
      clearInterval(interval);
    });
  });

  return httpServer;
}