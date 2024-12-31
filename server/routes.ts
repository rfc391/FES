import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { WebSocket, WebSocketServer } from "ws";
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { IncomingMessage } from 'http';

declare module 'express-session' {
  interface SessionData {
    passport: {
      user?: number;
    };
  }
}

export function registerRoutes(app: Express): Server {
  // Setup authentication first
  setupAuth(app);

  // Add error handler middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  // Proxy /api/process-signal requests to Python backend with better error handling
  app.use('/api/process-signal', createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
    pathRewrite: {
      '^/api/process-signal': '/api/process-signal'
    },
    onProxyReq: (proxyReq, req, res) => {
      if (!req.isAuthenticated()) {
        (res as Response).status(401).json({ error: 'Unauthorized' });
        return;
      }
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      (res as Response).status(503).json({
        error: 'Service unavailable',
        message: 'Unable to connect to signal processing service'
      });
    }
  }));

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: "/api/threats",
    verifyClient: (info, callback) => {
      const req = info.req as IncomingMessage & {
        session?: Express.Session;
      };

      if (!req.session?.passport?.user) {
        callback(false, 401, 'Unauthorized');
        return;
      }
      callback(true);
    }
  });

  wss.on("connection", (ws) => {
    console.log("Client connected to threat feed");

    // Keep track of connection state
    let isAlive = true;
    ws.on('pong', () => {
      isAlive = true;
    });

    // Heartbeat to check connection
    const pingInterval = setInterval(() => {
      if (!isAlive) {
        ws.terminate();
        return;
      }
      isAlive = false;
      ws.ping();
    }, 30000);

    // Simulate threat data
    const threatInterval = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        return;
      }

      try {
        const threat = {
          id: Math.random().toString(36).substr(2, 9),
          type: ["Malware", "DDoS", "Data Breach", "Phishing"][Math.floor(Math.random() * 4)],
          severity: Math.random() > 0.7 ? "high" : "medium",
          location: ["US", "CN", "RU", "UK", "DE"][Math.floor(Math.random() * 5)],
          latitude: (Math.random() * 180) - 90,
          longitude: (Math.random() * 360) - 180,
          timestamp: new Date().toISOString()
        };

        ws.send(JSON.stringify(threat));
      } catch (error) {
        console.error('Error sending threat data:', error);
      }
    }, 2000);

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clearInterval(threatInterval);
      clearInterval(pingInterval);
    });

    ws.on("close", () => {
      console.log("Client disconnected from threat feed");
      clearInterval(threatInterval);
      clearInterval(pingInterval);
    });
  });

  return httpServer;
}