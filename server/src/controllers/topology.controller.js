import { Topology } from "../models/topology.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
/*
1. Create topology
2. get topology -> get through req.user._id for a specific user -> verifyJWT
3. get public topology -> direct search for all the publicly available
4. get topology by id -> req.params bcoz id will be part of URL
5. update topology -> id (for which topoloy so req.params) & req.body for the other ones
6. delete topology-> req.params which specific topology
*/

// CREATE
const createTopology = asyncHandler(async (req, res) => {
  const { name, description, nodes, edges, isPublic } = req.body;

  if (!name || !nodes || !edges) {
    throw new ApiError(400, "name, nodes and edges are required");
  }

  const topology = await Topology.create({
    name,
    description,
    nodes,
    edges,
    isPublic: isPublic || false,
    owner: req.user._id
  });

  return res
    .status(201)
    .json(new ApiResponse(201, topology, "Topology created successfully"));
});

// GET MY TOPOLOGIES
const getMyTopologies = asyncHandler(async (req, res) => {
  const topologies = await Topology.find({ owner: req.user._id }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, topologies, "Topologies fetched successfully"));
});

// GET PUBLIC TOPOLOGIES
const getPublicTopologies = asyncHandler(async (req, res) => {
  const topologies = await Topology.find({ isPublic: true })
    .populate("owner", "username")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, topologies, "Public topologies fetched successfully"));
});

// GET SINGLE TOPOLOGY BY ID
const getTopologyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const topology = await Topology.findById(id).populate("owner", "username");

  if (!topology) {
    throw new ApiError(404, "Topology not found");
  }

  // only allow access if public OR owned by requester
  const isOwner = req.user && topology.owner._id.toString() === req.user._id.toString();

  if (!topology.isPublic && !isOwner) {
    throw new ApiError(403, "This topology is private");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, topology, "Topology fetched successfully"));
});

// UPDATE TOPOLOGY
const updateTopology = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, nodes, edges, isPublic } = req.body;

  const topology = await Topology.findById(id);

  if (!topology) {
    throw new ApiError(404, "Topology not found");
  }

  if (topology.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to edit this topology");
  }

  if (name !== undefined) topology.name = name;
  if (description !== undefined) topology.description = description;
  if (nodes !== undefined) topology.nodes = nodes;
  if (edges !== undefined) topology.edges = edges;
  if (isPublic !== undefined) topology.isPublic = isPublic;

  await topology.save();

  return res
    .status(200)
    .json(new ApiResponse(200, topology, "Topology updated successfully"));
});

// DELETE TOPOLOGY
const deleteTopology = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const topology = await Topology.findById(id);

  if (!topology) {
    throw new ApiError(404, "Topology not found");
  }

  if (topology.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this topology");
  }

  await topology.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Topology deleted successfully"));
});

export {
  createTopology,
  getMyTopologies,
  getPublicTopologies,
  getTopologyById,
  updateTopology,
  deleteTopology
};