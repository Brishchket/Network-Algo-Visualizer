import { Run } from "../models/run.models.js";
import { Topology } from "../models/topology.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// CREATE — save a run after algorithm executes
const createRun = asyncHandler(async (req, res) => {
  const { topologyId, algorithmType, startNode, steps, result } = req.body;

  if (!topologyId || !algorithmType || !steps || !result) {
    throw new ApiError(400, "topologyId, algorithmType, steps and result are required");
  }

  const topology = await Topology.findById(topologyId);
  if (!topology) {
    throw new ApiError(404, "Topology not found");
  }

  const run = await Run.create({
    user: req.user._id,
    topology: topologyId,
    algorithmType,
    startNode,
    steps,
    result
  });

  return res
    .status(201)
    .json(new ApiResponse(201, run, "Run saved successfully"));
});

// GET MY RUN HISTORY
const getMyRun = asyncHandler(async (req, res) => {
  const history = await Run.find({ user: req.user._id })
    .populate("topology", "name")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, history, "Run history fetched successfully"));
});

// GET SINGLE RUN BY ID (owner only)
const getRunById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const run = await Run.findById(id).populate("topology", "name nodes edges");

  if (!run) {
    throw new ApiError(404, "Run not found");
  }

  if (run.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to view this run");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, run, "Run fetched successfully"));
});


// DELETE RUN
const deleteRun = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const run = await Run.findById(id);

  if (!run) {
    throw new ApiError(404, "Run not found");
  }

  if (run.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this run");
  }

  await run.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Run deleted successfully"));
});

export {
  createRun,
  getMyRun,
  getRunById,
  deleteRun
};