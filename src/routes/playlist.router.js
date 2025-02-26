import { Router } from "express";
import { 
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const playlistRouter = Router();
playlistRouter.use(verifyJWT);

playlistRouter.route("/")
    .post(createPlaylist)

playlistRouter.route("/:playlistID")
    .patch(updatePlaylist)
    .delete(deletePlaylist)

playlistRouter.route("/:playlistID/videos")
    .post(addVideoToPlaylist)


export default playlistRouter