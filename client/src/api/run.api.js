import api from "./axios";

export const createRun = (data) => api.post("/runs", data);
export const getMyRuns = () => api.get("/runs");
export const getRunById = (id) => api.get(`/runs/${id}`);
export const deleteRun = (id) => api.delete(`/runs/${id}`);