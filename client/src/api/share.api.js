import api from "./axios";

/*------------ for avoiding writing the api calls and make the code cleaner -----------------*/

// for generating the share link
export const generateShareLink = (data) => api.post("/share", data);

// for getting the shared resource
export const getSharedResource = (shareToken) => api.get(`/share/${shareToken}`);

// for revoking the share link
export const revokeShareLink = (shareToken) => api.delete(`/share/${shareToken}`);