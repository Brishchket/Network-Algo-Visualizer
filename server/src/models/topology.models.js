import mongoose, { Schema } from 'mongoose'

/*
This is for the saved graph topologies that the user saves
*/

// some helper schemas for topology schema
// as we will storing nodes and edges so we require a lot of info so better to make new schema
const nodeSchema = new Schema({
  id: { type: String, required: true },
  label: { type: String },
  x: { type: Number },
  y: { type: Number }
});

const edgeSchema = new Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  weight: { type: Number, default: 1 }
});

// main topology Schema
const topologySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    nodes: {
      type: [nodeSchema],
      required: true
    },
    edges: {
      type: [edgeSchema],
      required: true
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    isPreset: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export const Topology = mongoose.model("Topology", topologySchema);