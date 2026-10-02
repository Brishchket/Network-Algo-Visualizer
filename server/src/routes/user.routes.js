import { Router } from "express"
import 
{ 
  sendOtp,
  verifyEmailOtp,
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  checkUsernameAvailability,
  updateProfile,
  completeProfile,
  setPassword,
  changePassword
} from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { rateLimit } from "../utils/rateLimiter.js";

const router = Router()

// Rate limiters
const usernameLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    keyPrefix: "rl:username",
    message: "Too many username checks"
});

const passwordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyPrefix: "rl:password",
    message: "Too many password attempts"
});

// sendOtp
router.route('/send-otp').post(sendOtp)

// verifyEmailOtp
router.route('/verify-otp').post(verifyEmailOtp)

//registerUser
router.route('/register').post(registerUser)

//loginUser
router.route('/login').post(loginUser)

//getCurrentUser
router.route('/current-user').get(verifyJWT, getCurrentUser)

//refreshAccessToken
router.route('/refresh-token').post(refreshAccessToken)

// logoutUser
router.route('/logout').post(verifyJWT, logoutUser)

// Profile routes
router.route('/username-available').get(verifyJWT, usernameLimiter, checkUsernameAvailability)
router.route('/profile').patch(verifyJWT, updateProfile)
router.route('/complete-profile').post(verifyJWT, completeProfile)
router.route('/password').post(verifyJWT, passwordLimiter, setPassword)
router.route('/password').patch(verifyJWT, passwordLimiter, changePassword)

export default router;