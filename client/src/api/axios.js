/*
custom Axios instance so that you don't have to repeatedly write the same configuration for every API request

Instead of doing:
axios.get("http://localhost:8000/api/v1/users");
axios.post("http://localhost:8000/api/v1/topologies");
axios.get("http://localhost:8000/api/v1/runs");

you create a configured Axios object once:

const api = axios.create({...});

and then use:

api.get("/users"); -> does the api call for http://localhost:8000/api/v1/users
api.post("/topologies"); -> does the api call for http://localhost:8000/api/v1/topologies
api.get("/runs"); -> does the api call for http://localhost:8000/api/v1/runs

Much cleaner.

*/

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  withCredentials: true  // sends cookies automatically
});

export default api;