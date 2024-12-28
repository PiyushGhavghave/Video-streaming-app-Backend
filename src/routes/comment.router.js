import { Router } from "express";
import { 
    postComment,
    updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const commentRouter = Router()
commentRouter.use(verifyJWT)

commentRouter.route("/")
    .post(postComment)
    .patch(updateComment)



export default commentRouter