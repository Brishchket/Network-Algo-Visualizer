import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: "./.env" });
import passport from "passport";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Passport configuration (registers Google Strategy)
import "./src/passport.js";

const app = express();
app.set('trust proxy', 1)
app.use(express.static(path.join(__dirname, "../client/dist")));
app.get("*", (req, res) => { 
  res.sendFile(path.join(__dirname, "../client/dist/index.html")); 
});
// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);


app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());

// Routes
import userRouter from "./src/routes/user.routes.js";
import algorithmRouter from "./src/routes/algorithm.routes.js";
import topologyRouter from "./src/routes/topology.routes.js";
import runRouter from "./src/routes/run.routes.js";
import shareRouter from "./src/routes/share.routes.js";
import googleRouter from "./src/routes/google.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/topologies", topologyRouter);
app.use("/api/v1/algorithms", algorithmRouter);
app.use("/api/v1/run", runRouter);
app.use("/api/v1/share", shareRouter);

// Google OAuth Routes
app.use("/auth", googleRouter);

// Serve static files from React build (production)
import fs from "fs";
const distPath = path.join(__dirname, "../client/dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // Fallback to index.html for client-side routing (use regex for Express 5 compatibility)
  app.get(/.*/i, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || "Internal Server Error",
  });
});

export { app };