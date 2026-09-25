import Redis from "ioredis";

/**
 * What's happening here:

new Redis(process.env.REDIS_URL) opens the connection using the URL from your .env.
The "connect" and "error" listeners just give you visibility in your server logs — you'll see "Redis connected" on startup, or a clear error if the connection fails (wrong URL, Docker container not running, etc.).
export default redisClient means anywhere else in the app can do import redisClient from "../db/redis.js" and reuse this same connection instead of opening a new one each time.
 * 
 */

const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redisClient.on("connect", () => {
  console.log("Redis connected");
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

export default redisClient;