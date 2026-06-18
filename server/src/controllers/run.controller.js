import { Run } from "../models/run.models.js";
import { Topology } from "../models/topology.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


/*
1. create the run
2. get run history
3. get run by id
4. delete run
*/


// CREATE — save a run after algorithm executes
const createRun = asyncHandler(async (req, res) => {

  /*
  1. get the details for the req.body
  2. find the topology
  3. create run
  4. return success message
  */

  const { topologyId, algorithmType, startNode, steps, result } = req.body; // user input through req.body

  if (!topologyId || !algorithmType || !steps || !result) {
    throw new ApiError(400, "topologyId, algorithmType, steps and result are required"); // if any one of the field is missing throw error
  }

  const topology = await Topology.findById(topologyId); // find the topology by the id
  if (!topology) {
    throw new ApiError(404, "Topology not found"); // throw error if topology doesn't exists
  }
  // create run
  const run = await Run.create({
    user: req.user._id,
    topology: topologyId,
    algorithmType,
    startNode,
    steps,
    result
  });
  // return success response
  return res
    .status(201)
    .json(new ApiResponse(201, run, "Run saved successfully"));
});

// GET MY RUN HISTORY
const getMyRun = asyncHandler(async (req, res) => {
  
  /*
  1. get the run through id
  2. return response
  */
  
  // find the user by id fetch topology name and in newest -> oldest order
  const run = await Run.find({ user: req.user._id })
    .populate("topology", "name")
    .sort({ createdAt: -1 });
  // return respnse
  return res
    .status(200)
    .json(new ApiResponse(200, run, "Run run fetched successfully"));
});

// GET SINGLE RUN BY ID (owner only)
const getRunById = asyncHandler(async (req, res) => {

  /*
  1. get the id from params
  2. find the run
  3. check the user
  4. return success message  
  */

  const { id } = req.params; // id from params

  const run = await Run.findById(id).populate("topology", "name nodes edges"); // find the run

  if (!run) {
    throw new ApiError(404, "Run not found"); // throw error if run doesn't exists
  }

  if (run.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to view this run"); // if the run user doesn't match with the requesting user throw error
  }
  
  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, run, "Run fetched successfully"));
});


// DELETE RUN
const deleteRun = asyncHandler(async (req, res) => {
 
  /*
  1. get the id from params
  2. find the run
  3. check the user
  4. delete the user
  5. return success message  
  */
  const { id } = req.params; // id from params

  const run = await Run.findById(id); // find the run

  if (!run) {
    throw new ApiError(404, "Run not found"); // throw error if run doesn't exists
  }

  if (run.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this run"); // if the run user doesn't match with the requesting user throw error
  }

  await run.deleteOne(); // delete the user
  
  // return response
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