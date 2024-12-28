import { Router } from "express";
import { 
    postComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const commentRouter = Router()
commentRouter.use(verifyJWT)

commentRouter.route("/")
    .post(postComment)



export default commentRouter