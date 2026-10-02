import redis from "../db/redis.js";
import { ApiError } from "./ApiError.js";

// Fixed window rate limiter using Redis INCR + EXPIRE
export const rateLimit = (options) => {
    const { windowMs, max, keyPrefix, message } = options;
    const windowSeconds = Math.floor(windowMs / 1000);

    return async (req, res, next) => {
        if (!redis) {
            console.warn("Redis not connected, skipping rate limit");
            return next();
        }

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        // Use userId if available, else fallback to IP
        const identifier = req.user ? req.user._id.toString() : ip;
        const key = `${keyPrefix}:${identifier}`;

        try {
            const current = await redis.incr(key);
            if (current === 1) {
                await redis.expire(key, windowSeconds);
            }

            if (current > max) {
                throw new ApiError(429, message || "Too many requests, please try again later.");
            }

            next();
        } catch (error) {
            if (error instanceof ApiError) return next(error);
            console.warn("Redis rate limit error:", error);
            // Fail open
            next();
        }
    };
};
