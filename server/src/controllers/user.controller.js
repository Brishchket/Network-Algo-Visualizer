import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  generateAndSendOtp,
  verifyOtp,
  isEmailVerified,
  clearVerifiedFlag,
} from "../utils/otp.js";
import jwt from "jsonwebtoken";
import { serializeUser } from "../utils/userSerializer.js";
import { normalizeUsername, validateUsername, validatePassword } from "../utils/validators.js";

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

// REGISTER
const registerUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  let { username } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }
  
  username = normalizeUsername(username);
  
  const userCheck = validateUsername(username);
  if (!userCheck.valid) {
      throw new ApiError(400, userCheck.reason);
  }
  
  const passCheck = validatePassword(password);
  if (!passCheck.valid) {
      throw new ApiError(400, passCheck.reason);
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new ApiError(409, "Username or email already exists");
  }

  if (!(await isEmailVerified(email))) {
    throw new ApiError(403, "Please verify your email with the OTP first");
  }

  const user = await User.create({ username, email, password });
  await clearVerifiedFlag(email);

  const createdUser = await User.findById(user._id);

  return res
    .status(201)
    .json(new ApiResponse(201, serializeUser(createdUser), "User registered successfully"));
});

// LOGIN
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  
  if (!user.password) {
      throw new ApiError(401, "This account uses Google sign-in. Sign in with Google, or set a password from your profile.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { user: serializeUser(loggedInUser), accessToken }, "Login successful"));
});


// LOGOUT
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logout successful"));
});

// REFRESH TOKEN
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);
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
  const user = await User.findById(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, serializeUser(user), "Current user fetched successfully"));
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

// SEND OTP
const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "Email already registered");
  }

  try {
    await generateAndSendOtp(email);
  } catch (err) {
    throw new ApiError(429, err.message || "Could not send OTP");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP sent to email"));
});

// VERIFY OTP
const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  let isValid;
  try {
    isValid = await verifyOtp(email, otp);
  } catch (err) {
    throw new ApiError(429, err.message || "Could not verify OTP");
  }

  if (!isValid) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verified successfully"));
});

// GET /username-available
const checkUsernameAvailability = asyncHandler(async (req, res) => {
    let { username } = req.query;
    if (!username) {
        return res.status(200).json(new ApiResponse(200, { available: false, reason: "Username is required" }, "Checked"));
    }
    
    username = normalizeUsername(username);
    const user = await User.findById(req.user._id);
    if (username === user.username) {
         return res.status(200).json(new ApiResponse(200, { available: true }, "Checked"));
    }
    
    const check = validateUsername(username);
    if (!check.valid) {
        return res.status(200).json(new ApiResponse(200, { available: false, reason: check.reason }, "Checked"));
    }
    
    const exists = await User.exists({ username });
    if (exists) {
        return res.status(200).json(new ApiResponse(200, { available: false, reason: "Username is already taken" }, "Checked"));
    }
    
    return res.status(200).json(new ApiResponse(200, { available: true }, "Checked"));
});

// PATCH /profile
const updateProfile = asyncHandler(async (req, res) => {
    const { fullName, bio } = req.body;
    let { username } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");
    
    if (username !== undefined) {
        username = normalizeUsername(username);
        if (username !== user.username) {
            const check = validateUsername(username);
            if (!check.valid) throw new ApiError(400, check.reason);
            user.username = username;
        }
    }
    
    if (fullName !== undefined) {
        user.fullName = fullName.trim().substring(0, 60);
    }
    
    if (bio !== undefined) {
        user.bio = bio.trim().substring(0, 160);
    }
    
    try {
        await user.save();
    } catch (err) {
        if (err.code === 11000 && err.keyPattern?.username) {
            throw new ApiError(409, "Username is already taken");
        }
        throw err;
    }
    
    return res.status(200).json(new ApiResponse(200, serializeUser(user), "Profile updated"));
});

// POST /complete-profile
const completeProfile = asyncHandler(async (req, res) => {
    const { password } = req.body;
    let { username } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");
    if (user.password) throw new ApiError(409, "Profile is already complete");
    
    const passCheck = validatePassword(password);
    if (!passCheck.valid) throw new ApiError(400, passCheck.reason);
    user.password = password;
    
    if (username !== undefined) {
        username = normalizeUsername(username);
        if (username !== user.username) {
            const check = validateUsername(username);
            if (!check.valid) throw new ApiError(400, check.reason);
            user.username = username;
        }
    }
    
    try {
        await user.save();
    } catch (err) {
        if (err.code === 11000 && err.keyPattern?.username) {
            throw new ApiError(409, "Username is already taken");
        }
        throw err;
    }
    
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    
    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(200, serializeUser(user), "Profile completed"));
});

// POST /password
const setPassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");
    if (user.password) throw new ApiError(409, "Password already exists");
    
    const passCheck = validatePassword(newPassword);
    if (!passCheck.valid) throw new ApiError(400, passCheck.reason);
    
    user.password = newPassword;
    await user.save();
    
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    
    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(200, serializeUser(user), "Password set successfully"));
});

// PATCH /password
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");
    if (!user.password) throw new ApiError(400, "Password not set");
    
    const isPasswordValid = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordValid) throw new ApiError(401, "Incorrect current password");
    
    if (currentPassword === newPassword) {
        throw new ApiError(400, "New password must be different");
    }
    
    const passCheck = validatePassword(newPassword);
    if (!passCheck.valid) throw new ApiError(400, passCheck.reason);
    
    user.password = newPassword;
    await user.save();
    
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    
    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(200, serializeUser(user), "Password changed successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  googleCallback,
  sendOtp,
  verifyEmailOtp,
  checkUsernameAvailability,
  updateProfile,
  completeProfile,
  setPassword,
  changePassword
};
