import { Share } from "../models/share.models.js";
import { Topology } from "../models/topology.model.js";
import { Run } from "../models/run.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "crypto";

const resourceModelMap = {
  Topology,
  Run
};

// GENERATE SHARE LINK (works for both topology and run)
const generateShareLink = asyncHandler(async (req, res) => {
  const { resourceType, resourceId } = req.body;

  if (!resourceType || !resourceId) {
    throw new ApiError(400, "resourceType and resourceId are required");
  }

  if (!["Topology", "Run"].includes(resourceType)) {
    throw new ApiError(400, "resourceType must be 'Topology' or 'Run'");
  }

  const Model = resourceModelMap[resourceType];
  const resource = await Model.findById(resourceId);

  if (!resource) {
    throw new ApiError(404, `${resourceType} not found`);
  }

  // ownership check — different field names across models
  const ownerField = resourceType === "Topology" ? resource.owner : resource.user;
  if (ownerField.toString() !== req.user._id.toString()) {
    throw new ApiError(403, `You are not allowed to share this ${resourceType.toLowerCase()}`);
  }

  // check if a share already exists for this resource
  let share = await Share.findOne({ resourceType, resourceId });

  if (!share) {
    share = await Share.create({
      resourceType,
      resourceId,
      shareToken: crypto.randomBytes(16).toString("hex"),
      createdBy: req.user._id
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { shareToken: share.shareToken }, "Share link generated successfully"));
});

// GET SHARED RESOURCE (no auth required)
const getSharedResource = asyncHandler(async (req, res) => {
  const { shareToken } = req.params;

  const share = await Share.findOne({ shareToken });

  if (!share) {
    throw new ApiError(404, "Shared resource not found");
  }

  const Model = resourceModelMap[share.resourceType];
  const resource = await Model.findById(share.resourceId).populate(
    share.resourceType === "Topology" ? "owner" : "user",
    "username"
  );

  if (!resource) {
    throw new ApiError(404, "The shared resource no longer exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { resourceType: share.resourceType, resource }, "Shared resource fetched successfully"));
});

// REVOKE SHARE LINK
const revokeShareLink = asyncHandler(async (req, res) => {
  const { shareToken } = req.params;

  const share = await Share.findOne({ shareToken });

  if (!share) {
    throw new ApiError(404, "Share link not found");
  }

  if (share.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to revoke this share link");
  }

  await share.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Share link revoked successfully"));
});

export { generateShareLink, getSharedResource, revokeShareLink };