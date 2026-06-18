import mongoose from "mongoose";

const runSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    topology: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topology",
      required: true
    },
    algorithmType: {
      type: String,
      required: true,
      enum: [
        "bfs",
        "dfs",
        "dijkstra",
        "bellmanFord",
        "prim",
        "kruskal",
        "distanceVector",
        "linkState"
      ]
    },
    startNode: {
      type: String
    },
    steps: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: true }
);

export const Run = mongoose.model("Run", runSchema);