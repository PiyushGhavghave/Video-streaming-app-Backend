import { Router } from "express";
import { 
    createPlaylist,
    addVideoToPlaylist
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const playlistRouter = Router();
playlistRouter.use(verifyJWT);

playlistRouter.route("/")
    .post(createPlaylist)

playlistRouter.route("/:playlistID/videos")
    .post(addVideoToPlaylist)


export default playlistRouter