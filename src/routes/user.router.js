import {Router} from 'express'
import {registerUser, loginUser, logoutUser, refreshAccessToken} from '../controllers/user.controller.js'
import {upload} from '../middlewares/multer.middleware.js'
import {verifyJWT} from "../middlewares/auth.middleware.js"

const userRouter = Router()

// declare register route... also add multer middleware
userRouter.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount :1,
        },
        {
            name: "coverImage",
            maxCount : 1
        }
    ]),
    registerUser
)

userRouter.route("/login").post(loginUser)

userRouter.route("/refresh-token").post(refreshAccessToken)

//------------- secured route - user should be logged in (have access token)
userRouter.route("/logout").post(verifyJWT ,logoutUser)

export default userRouter