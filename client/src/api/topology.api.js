import api from "./axios";

export const createTopology = (data) => api.post("/topologies", data);
export const getMyTopologies = () => api.get("/topologies");
export const getPublicTopologies = () => api.get("/topologies/public");
export const getTopologyById = (id) => api.get(`/topologies/${id}`);
export const updateTopology = (id, data) => api.patch(`/topologies/${id}`, data);
export const deleteTopology = (id) => api.delete(`/topologies/${id}`);
export const generateTopologyShareLink = (id) => api.post(`/topologies/${id}/share`);
export const getSharedTopology = (shareToken) => api.get(`/topologies/shared/${shareToken}`);