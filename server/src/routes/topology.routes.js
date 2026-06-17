import { Router } from "express";
import {
  createTopology,
  getMyTopologies,
  getPublicTopologies,
  getTopologyById,
  updateTopology,
  deleteTopology,
} from "../controllers/topology.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// ─── Public (no auth required) ───────────────────────────────────────────────
router.get("/public", getPublicTopologies);

// ─── Semi-public (auth optional — controller checks ownership for private) ───
router.get("/:id", verifyJWT, getTopologyById);



// ─── Protected (auth required for all below) ─────────────────────────────────
router.use(verifyJWT);

router.route("/")
  .post(createTopology)
  .get(getMyTopologies);


// here verifyJWT should be there   
router.route("/:id")
  .patch(updateTopology)
  .delete(deleteTopology);

export default router;