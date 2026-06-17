import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

/*
1. get tokens from cookies or from user body
2. decode the token
3. search the user by id
4. next()
*/

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // u'll either get token through cookies or throungh header after the Bearer (used when no cookie jar is available ex= mobile apps, POSTMAN)
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") 
        if(!token) {
            throw new ApiError(401, "Unathorized request !!!") // if token doesn't exists throw error
        }
    
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id)
    
        if(!user) {
            throw new ApiError(401, "Invalid Access") // if user doesn't exists throw error
        }
        req.user = user // adds the user to the request so that we know who is making the request
        next()
    } catch (error) {
        throw new ApiError(500, error || "Something went wrong while accessing your request") // throw any error that occurs in the await function
    }
})

