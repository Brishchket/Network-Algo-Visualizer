import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import passport from "passport";

// Load environment variables


// Import Passport configuration (registers Google Strategy)
import "./src/passport.js";

const app = express();

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