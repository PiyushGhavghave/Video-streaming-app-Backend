import { Router } from "express";
import { 
    toggleVideoLike,
} from "../controllers/likes.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const likesRouter = Router()
likesRouter.use(verifyJWT)

likesRouter.route("/:videoId")
    .post(toggleVideoLike)


export default likesRouter
