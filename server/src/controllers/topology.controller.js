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

  /*
  1. get the user input throught req.body -> user input
  2. create topology
  3. return the success response
  */

  const { name, description, nodes, edges, isPublic } = req.body; // name, description, nodes, edges, isPublic all came through user imputs

  if (!name || !nodes || !edges) {
    throw new ApiError(400, "name, nodes and edges are required"); // if any of name nodes edges missing throw error 
  }
  // create topology with the user input
  const topology = await Topology.create({
    name,
    description,
    nodes,
    edges,
    isPublic: isPublic || false, // by default private
    owner: req.user._id
  });

  // return success response
  return res
    .status(201)
    .json(new ApiResponse(201, topology, "Topology created successfully"));
});

// GET MY TOPOLOGIES
const getMyTopologies = asyncHandler(async (req, res) => {
  /*
  1. get the _id from the req.user(added by auth middleware)._id => we want to fetch the saved topologies of the user so we need the info about 
  user so ._id field
  2. find the topolgies with that user id
  3. return the topologies
  */
  
  //to find all the topologies we need to use .find and for owner : req.user._id & sort the topologies in descending order i.e  createdAt: -1 =>  newest -> oldest
  const topologies = await Topology.find({ owner: req.user._id }).sort({ createdAt: -1 }); 
 
  // return the topologies
  return res
    .status(200)
    .json(new ApiResponse(200, topologies, "Topologies fetched successfully"));
});

// GET PUBLIC TOPOLOGIES
const getPublicTopologies = asyncHandler(async (req, res) => {
  /*
  1. Search for all the topologies where isPublic: true
  2. return all the topologies
  */
  
  const topologies = await Topology.find({ isPublic: true }) // finds the topology records where isPublic: true
    .populate("owner", "username") // fetches owner and username
    .sort({ createdAt: -1 }); // sorts for newest to oldest
 
  // return the public topologies
  return res
    .status(200)
    .json(new ApiResponse(200, topologies, "Public topologies fetched successfully"));
});

// GET SINGLE TOPOLOGY BY ID
const getTopologyById = asyncHandler(async (req, res) => {
  /*
  1. get the id from params cause id will be part of the URL (we have to fetch the topology with specified id only)
  2. search for the topology with that id -> use findById
  3. return the topoloy
  */
  
  
  const { id } = req.params; // id is part of URL so req.params

  const topology = await Topology.findById(id).populate("owner", "username"); // find the topologies with that id and fetch the owner and username

  if (!topology) {
    throw new ApiError(404, "Topology not found"); // if no topology exists throw error
  }

  // only allow access if public OR owned by requester
  const isOwner = req.user && topology.owner._id.toString() === req.user._id.toString();

  if (!topology.isPublic && !isOwner) {
    throw new ApiError(403, "This topology is private"); // if isn't public and isn't the owner throw error
  }
 // return the topology
  return res
    .status(200)
    .json(new ApiResponse(200, topology, "Topology fetched successfully"));
});

// UPDATE TOPOLOGY
const updateTopology = asyncHandler(async (req, res) => {
  
  /*
  1. get the id of the topology to update from the params cause id will be part of the URL (we have to fetch the topology with specified id only)
  2. get the updated data from the user through req.body
  3. find the topology by the findById
  4. if the user isn't the owner throw error
  5. update all the updated fields
  6. save the updated topology
  7. return the success response
  */
  
  const { id } = req.params; // id is part of URL so req.params
  const { name, description, nodes, edges, isPublic } = req.body; // name, description, nodes, edges, isPublic all came through user imputs

  const topology = await Topology.findById(id); // find the topologies with that id

  if (!topology) {
    throw new ApiError(404, "Topology not found"); // if no topology exists throw error
  }

  if (topology.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to edit this topology"); // if the user isn't the owner throw error
  }
  // update all the updated fields
  if (name !== undefined) topology.name = name;
  if (description !== undefined) topology.description = description;
  if (nodes !== undefined) topology.nodes = nodes;
  if (edges !== undefined) topology.edges = edges;
  if (isPublic !== undefined) topology.isPublic = isPublic;

  await topology.save(); // save the updated topology
  
  // return the response
  return res
    .status(200)
    .json(new ApiResponse(200, topology, "Topology updated successfully"));
});

// DELETE TOPOLOGY
const deleteTopology = asyncHandler(async (req, res) => {
  
  /*
  1. get the id of the topology to update from the params cause id will be part of the URL (we have to fetch the topology with specified id only)
  2. find the topology by findById
  3. check if user is owner 
  4. delete the topology 
  */
  
  const { id } = req.params; // id is part of URL so req.params

  const topology = await Topology.findById(id); // find the topology by the id

  if (!topology) {
    throw new ApiError(404, "Topology not found");// if no topology exists throw error
  }

  if (topology.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this topology"); // if the user isn't the owner throw error
  }

  await topology.deleteOne(); // delete the topology
  
  // return the response
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