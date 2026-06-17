import { Router } from "express"
import 
{ 
    registerUser,
    refreshAccessToken,
    getCurrentUser,
    loginUser,
    logoutUser
} from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"


/*
1. make routes for all the five
2. add verifyJWT for logoutUser, getCurrentUser
*/

const router = Router()

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


export default router;