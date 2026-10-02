import api from "./axios";

export const checkUsernameAvailability = (username) => {
    return api.get("/users/username-available", { params: { username } });
};

export const updateProfile = (data) => {
    return api.patch("/users/profile", data);
};

export const completeProfile = (data) => {
    return api.post("/users/complete-profile", data);
};

export const setPassword = (data) => {
    return api.post("/users/password", data);
};

export const changePassword = (data) => {
    return api.patch("/users/password", data);
};
