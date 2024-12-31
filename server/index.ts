
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function startServer() {
    const server = registerRoutes(app);
    
    // Configure environment-specific settings
    if (app.get("env") === "development") {
        await setupVite(app, server);
    } else {
        serveStatic(app);
    }

    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, "0.0.0.0", () => {
        log(`Server running on port ${PORT}`);
    });
}

// Initialize server
startServer().catch((error) => {
    log(`Failed to start server: ${error.message}`);
    process.exit(1);
});
