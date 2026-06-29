import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// cookie structure
// {
//   _id: "...",
//   username: "...",
//   email: "...",
//   password: "..."
// }

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false }); // validateBeforeSave: false -> for the required fields

  return { accessToken, refreshToken };
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

// REGISTER
const registerUser = asyncHandler(async (req, res) => {

  /*
    1. Get username, email, password from the user
    2. Check if existing user 
               /              \
      if yes -> throw         create a user in mongodb
      an error ("Username or 
      email exists")
    3. return the user 
  */

  const { username, email, password } = req.body; // for request body we will get -> user sends the data through POST request so we will be needing req.body

  if (!username || !email || !password) {
    throw new ApiError(400, "All fields are required"); // all three fields are necessary for registering the user
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] }); // $or searches for username and email and findOne -> first user 
  if (existingUser) {
    throw new ApiError(409, "Username or email already exists"); // user exists so throw error 
  }

  const user = await User.create({ username, email, password }); //  create user with the provided field

  // fetch the user data without password and refreshToken field-> safety (WHO WANTS THERE PASSWORD LEAKED)
  const createdUser = await User.findById(user._id).select("-password -refreshToken"); 

  // sending the response
  return res 
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// LOGIN
const loginUser = asyncHandler(async (req, res) => {
/*
1. get email and password from user through req.body
2. find the user by email -> (if user doesn't exists throw ERROR)
3. check password -> (if password doesn't match throw ERROR)
4. generate access and refresh tokens
5. return success message
*/


  const { email, password } = req.body; // get email and password for req.body

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required"); // throw error if any one of the field is missing
  }

  const user = await User.findOne({ email }); // find the user based on the email
  if (!user) {
    throw new ApiError(404, "User not found"); // if the user email doesn't exists throw error
  }

  const isPasswordValid = await user.isPasswordCorrect(password); // check the password
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials"); // throw error for wrong password
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id); // generate the access token and refresh token for the user

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken"); // fetch the user data without password and refreshToken field

  // return the user data and success message
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken }, "Login successful"));
});


// LOGOUT
// verifyJWT middleware runs before this controller,
// so req.user already contains the authenticated user's data.
const logoutUser = asyncHandler(async (req, res) => {

  /*
  1. through the cookie we will get the user id req.user._id
  2. unset the refreshToken
  3. remove the cookies from the user browser and send the data
  */



  // Remove the refresh token stored in the database
  // for the currently authenticated user.
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  // Clear the access and refresh token cookies
  // from the client's browser and send a success response.
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logout successful"));
});

// REFRESH TOKEN
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken; // either get the refreshToken from cookies or body

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request"); // if no refreshToken deny access and throw error
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    ); // get the decoded payload of the token

    const user = await User.findById(decodedToken?._id);  // search the user based on the user id

    if (!user) {
      throw new ApiError(401, "Invalid refresh token"); //return error if user doesn't exists
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used"); // if user refreshToken is not matching throw error
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id); // generate new refreshToken for the user
    // send the data
    return res 
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          {},
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// GET CURRENT USER
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const googleCallback = asyncHandler(async (req, res) => {
    const user = req.user;
    const frontendOrigin = (process.env.FRONTEND_URI || "http://localhost:5173").replace(/\/$/, "");

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshToken(user._id);

    res
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .redirect(`${frontendOrigin}/auth/google/callback`);
});



export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  googleCallback
};