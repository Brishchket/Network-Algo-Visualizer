import { Router } from "express";
import { generateShareLink, getSharedResource, revokeShareLink } from "../controllers/share.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// public
router.get("/:shareToken", getSharedResource);

// protected
router.use(verifyJWT);
router.post("/", generateShareLink);
router.delete("/:shareToken", revokeShareLink);

export default router;