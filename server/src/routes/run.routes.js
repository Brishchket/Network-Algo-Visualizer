import { Router } from "express";
import {
  createRun,
  getMyRun,
  getRunById,
  deleteRun
} from "../controllers/run.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


// ─── Protected (auth required for all below) ──────────────────────────────
router.use(verifyJWT);

router.route("/")
  .post(createHistory)
  .get(getMyHistory);

router.route("/:id")
  .get(getHistoryById)
  .delete(deleteHistory);

export default router;