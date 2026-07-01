import { Router } from "express";
import passport from "../passport.js";
import { googleCallback } from "../controllers/user.controller.js";

const router = Router()

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback/server",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/users/login",
  }),
  googleCallback
);

export default router;