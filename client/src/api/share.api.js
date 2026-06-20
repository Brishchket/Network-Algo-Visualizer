import api from "./axios";

export const generateShareLink = (data) => api.post("/share", data);
export const getSharedResource = (shareToken) => api.get(`/share/${shareToken}`);
export const revokeShareLink = (shareToken) => api.delete(`/share/${shareToken}`);