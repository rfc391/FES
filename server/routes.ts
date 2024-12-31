import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { createProxyMiddleware } from 'http-proxy-middleware';
import { db } from "@db";
import { setupAuth } from "./auth";
import { 
  users, threats, alerts, metrics, securityRecommendations,
  socialPosts, socialComments, socialConnections, socialLikes
} from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

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

  // Get security recommendations
  app.get('/api/security/recommendations', async (req, res) => {
    try {
      const recommendations = await db
        .select()
        .from(securityRecommendations)
        .orderBy(desc(securityRecommendations.priority));
      res.json(recommendations);
    } catch (error) {
      console.error('Error fetching security recommendations:', error);
      res.status(500).json({ error: 'Failed to fetch security recommendations' });
    }
  });

  // Apply security recommendation
  app.post('/api/security/recommendations/:id/apply', async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const [updatedRecommendation] = await db
        .update(securityRecommendations)
        .set({ 
          appliedAt: new Date(),
          appliedBy: req.user.id 
        })
        .where(eq(securityRecommendations.id, parseInt(req.params.id)))
        .returning();

      // Create an alert for the applied recommendation
      await db.insert(alerts).values({
        message: `Security recommendation "${updatedRecommendation.title}" has been applied`,
        priority: updatedRecommendation.priority,
        userId: req.user.id
      });

      res.json(updatedRecommendation);
    } catch (error) {
      console.error('Error applying security recommendation:', error);
      res.status(500).json({ error: 'Failed to apply security recommendation' });
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

  // Social Network Routes
  app.get('/api/social/posts', async (req, res) => {
    try {
      const posts = await db.query.socialPosts.findMany({
        with: {
          user: true,
          comments: true,
          likes: true,
        },
        orderBy: desc(socialPosts.createdAt),
        limit: 50,
      });

      const formattedPosts = posts.map(post => ({
        ...post,
        username: post.user.username,
        comments: post.comments.length,
        likes: post.likes.length,
      }));

      res.json(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });

  app.post('/api/social/posts', async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const [post] = await db
        .insert(socialPosts)
        .values({
          userId: req.user.id,
          content: req.body.content,
          tags: req.body.tags || [],
        })
        .returning();

      res.json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  });

  app.post('/api/social/posts/:id/like', async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const postId = parseInt(req.params.id);

      // Check if user already liked the post
      const [existingLike] = await db
        .select()
        .from(socialLikes)
        .where(
          and(
            eq(socialLikes.postId, postId),
            eq(socialLikes.userId, req.user.id)
          )
        );

      if (existingLike) {
        // Unlike the post
        await db
          .delete(socialLikes)
          .where(eq(socialLikes.id, existingLike.id));
      } else {
        // Like the post
        await db
          .insert(socialLikes)
          .values({
            postId,
            userId: req.user.id,
          });
      }

      const [updatedPost] = await db
        .select()
        .from(socialPosts)
        .where(eq(socialPosts.id, postId));

      res.json(updatedPost);
    } catch (error) {
      console.error('Error liking post:', error);
      res.status(500).json({ error: 'Failed to like post' });
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