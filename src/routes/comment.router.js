import { Router } from "express";
import { 
    postComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const commentRouter = Router()
commentRouter.use(verifyJWT)

commentRouter.route("/")
    .post(postComment)
    .patch(updateComment)

commentRouter.route("/:commentID")
    .delete(deleteComment)

export default commentRouter