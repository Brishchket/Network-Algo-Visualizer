import api from "./axios";

/*------------ for avoiding writing the api calls and make the code cleaner -----------------*/

// creating the topology
export const createTopology = (data) => api.post("/topologies", data);

// fetching the topology
export const getMyTopologies = () => api.get("/topologies");

// fetching the public topology
export const getPublicTopologies = () => api.get("/topologies/public");

// fetching the topology by Id
export const getTopologyById = (id) => api.get(`/topologies/${id}`);

// updating the topology
export const updateTopology = (id, data) => api.patch(`/topologies/${id}`, data);

// deleting the topology
export const deleteTopology = (id) => api.delete(`/topologies/${id}`);

// generating the topology
export const generateTopologyShareLink = (id) => api.post(`/topologies/${id}/share`);

// fetching the shared topology
export const getSharedTopology = (shareToken) => api.get(`/topologies/shared/${shareToken}`);