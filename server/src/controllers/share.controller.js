import { Share } from "../models/share.models.js";
import { Topology } from "../models/topology.models.js";
import { Run } from "../models/run.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "crypto";

// resource will have just topology (structure of the graph) or run(details about which algorithm to run)
const resourceModelMap = {
  Topology,
  Run
};

/*
1. generate share link
2. get shared resource
3. revoke share link
*/

// GENERATE SHARE LINK (works for both topology and run)
const generateShareLink = asyncHandler(async (req, res) => {
  /*
  1. Get the resourceType and resourceId
  2. find the topology with that resourceType
  3. generate share link
  4. return the share link
  */
  
  
  
  const { resourceType, resourceId } = req.body; // user will select which topology to send so we will get the info from req.body

  if (!resourceType || !resourceId) {
    throw new ApiError(400, "resourceType and resourceId are required"); // if any one of resourceType resourceId is missing throw error
  }

  if (!["Topology", "Run"].includes(resourceType)) {
    throw new ApiError(400, "resourceType must be 'Topology' or 'Run'"); // if the resourceType is anything else from topology and run throw error
  }

  const Model = resourceModelMap[resourceType]; // get the Model for the resourceType so that we can access all the data mapped to that particular resource Type in MongoDb
  const resource = await Model.findById(resourceId); // find the resource 

  if (!resource) {
    throw new ApiError(404, `${resourceType} not found`); // if resource doesn't exists throw error
  }

  // ownership check — different field names across models
  // if the resourceType is Topology then it has it's own owner field, else Run has owner in user itself  
  const ownerField = resourceType === "Topology" ? resource.owner : resource.user; 
  if (ownerField.toString() !== req.user._id.toString()) {
    throw new ApiError(403, `You are not allowed to share this ${resourceType.toLowerCase()}`); // if the user isn't the owner throw error
  }

  // check if a share already exists for this resource
  let share = await Share.findOne({ resourceType, resourceId }); 

  // if no share link then create one
  if (!share) {
    share = await Share.create({
      resourceType,
      resourceId,
      shareToken: crypto.randomBytes(16).toString("hex"),
      createdBy: req.user._id
    });
  }

  // return the resource
  return res
    .status(200)
    .json(new ApiResponse(200, { shareToken: share.shareToken }, "Share link generated successfully"));
});

// GET SHARED RESOURCE (no auth required)
const getSharedResource = asyncHandler(async (req, res) => {
  /*
  1. get the shareToken
  2. fetch the share object for that token
  3. find the resource which is shared
  4. return the  resource
  */

  const { shareToken } = req.params; // shareToken is part of the URL so req.params

  const share = await Share.findOne({ shareToken }); // find the share object with the shareToken

  if (!share) {
    throw new ApiError(404, "Shared resource not found"); // if share object doesn't exists throw error
  }

  const Model = resourceModelMap[share.resourceType]; // find the resourceType model
  
  // find the resource 
  const resource = await Model.findById(share.resourceId).populate(
  share.resourceType === "Topology"
    ? { path: "owner", select: "username" }
    : [
        { path: "user", select: "username" },
        { path: "topology", select: "name nodes edges" }
      ]
  );

  if (!resource) {
    throw new ApiError(404, "The shared resource no longer exists"); // if user doesn't exists throw error
  }
  
  // return the resource
  return res
    .status(200)
    .json(new ApiResponse(200, { resourceType: share.resourceType, resource }, "Shared resource fetched successfully"));
});

// REVOKE SHARE LINK
const revokeShareLink = asyncHandler(async (req, res) => {
  /*
  1. get the sharedToken
  2. find the share object
  3. check for creater
  4. delete the share link
  5. return success message
  */
  
  const { shareToken } = req.params; // shareToken is part of the URL so req.params

  const share = await Share.findOne({ shareToken }); // find the share object with the shareToken

  if (!share) {
    throw new ApiError(404, "Share link not found"); // if share object doesn't exists throw error
  }

  if (share.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to revoke this share link"); // if user isn't the creator throw error
  }

  await share.deleteOne(); // delete the share link

  // return success response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Share link revoked successfully"));
});

export { generateShareLink, getSharedResource, revokeShareLink };