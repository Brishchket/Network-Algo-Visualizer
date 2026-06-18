import mongoose, { Schema } from "mongoose";

const shareSchema = new Schema(
  {
    resourceType: {
      type: String,
      enum: ["Topology", "Run"],
      required: true
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "resourceType"
    },
    shareToken: {
      type: String,
      required: true,
      unique: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export const Share = mongoose.model("Share", shareSchema);