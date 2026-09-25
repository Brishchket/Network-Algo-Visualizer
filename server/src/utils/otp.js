import nodemailer from "nodemailer";
import { randomInt } from "crypto";
import redisClient from "../db/redis.js";

const OTP_TTL_SECONDS = 5 * 60;        // OTP valid for 5 minutes
const RESEND_COOLDOWN_SECONDS = 45;    // must wait 45s between resend requests
const VERIFIED_TTL_SECONDS = 15 * 60;  // 15 min window to finish registering after verifying
const MAX_ATTEMPTS = 5;                // wrong OTP attempts allowed before lockout
const ATTEMPTS_LOCK_SECONDS = 10 * 60; // lockout duration after too many wrong attempts

const otpKey = (email) => `otp:${email}`;
const cooldownKey = (email) => `otp:cooldown:${email}`;
const verifiedKey = (email) => `otp:verified:${email}`;
const attemptsKey = (email) => `otp:attempts:${email}`;
const lockKey = (email) => `otp:locked:${email}`;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generates a 6-digit OTP, stores it in Redis, and emails it to the user.
export const generateAndSendOtp = async (email) => {
  if (await redisClient.get(lockKey(email))) {
    throw new Error("Too many attempts. Please try again later.");
  }

  if (await redisClient.get(cooldownKey(email))) {
    throw new Error("Please wait before requesting another OTP");
  }

  const otp = randomInt(100000, 1000000).toString();

  await redisClient.set(otpKey(email), otp, "EX", OTP_TTL_SECONDS);
  await redisClient.set(cooldownKey(email), "1", "EX", RESEND_COOLDOWN_SECONDS);
  await redisClient.del(attemptsKey(email)); // reset attempt counter on a fresh OTP

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Your NetAlgoVis verification code",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });
};

// Verifies the OTP against Redis. On success, sets a short-lived "verified" flag
// that registerUser checks before creating the account.
export const verifyOtp = async (email, otp) => {
  if (await redisClient.get(lockKey(email))) {
    throw new Error("Too many attempts. Please try again later.");
  }

  const stored = await redisClient.get(otpKey(email));

  if (!stored || stored !== otp) {
    const attempts = await redisClient.incr(attemptsKey(email));
    if (attempts === 1) {
      await redisClient.expire(attemptsKey(email), OTP_TTL_SECONDS);
    }
    if (attempts >= MAX_ATTEMPTS) {
      await redisClient.set(lockKey(email), "1", "EX", ATTEMPTS_LOCK_SECONDS);
      await redisClient.del(otpKey(email));
      await redisClient.del(attemptsKey(email));
    }
    return false;
  }

  await redisClient.del(otpKey(email));
  await redisClient.del(attemptsKey(email));
  await redisClient.set(verifiedKey(email), "1", "EX", VERIFIED_TTL_SECONDS);
  return true;
};

export const isEmailVerified = async (email) => {
  return Boolean(await redisClient.get(verifiedKey(email)));
};

export const clearVerifiedFlag = async (email) => {
  await redisClient.del(verifiedKey(email));
};