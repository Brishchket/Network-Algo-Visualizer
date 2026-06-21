import api from "./axios";

/*------------ for avoiding writing the api calls and make the code cleaner -----------------*/

// creating the run
export const createRun = (data) => api.post("/run", data);

// fetching the run
export const getMyRuns = () => api.get("/run");

// fetching the run by ID
export const getRunById = (id) => api.get(`/run/${id}`);

// deleting the run
export const deleteRun = (id) => api.delete(`/run/${id}`);