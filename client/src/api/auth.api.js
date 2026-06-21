import api from "./axios";

/*------------ for avoiding writing the api calls and make the code cleaner -----------------*/

// for user registration
const registerUser = (data) => api.post("/users/register", data);

// for user login
const loginUser = (data) => api.post("/users/login", data);

// for logging out user
const logoutUser = () => api.post("/users/logout");

// for fetching the current user
const getCurrentUser = () => api.get("/users/current-user");

// for user refreshing the user access token
const refreshToken = () => api.post("/users/refresh-token");

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshToken
}