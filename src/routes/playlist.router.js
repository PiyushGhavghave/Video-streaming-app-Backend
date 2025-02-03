import { Router } from "express";
import { 
    createPlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const playlistRouter = Router();
playlistRouter.use(verifyJWT);

playlistRouter.route("/").post(createPlaylist)


export default playlistRouter