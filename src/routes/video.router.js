import {Router} from "express"
import { 
    getAllVideos,
    publishVideo,
    getVideobyId
} from "../controllers/video.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const videoRouter = Router()

videoRouter.route("/")
    .get(getAllVideos)
    .post(verifyJWT,
        upload.fields([
            {
                name : "video",
                maxCount : 1,
            },
            {
                name : "thumbnail",
                maxCount : 1,
            }
        ]),
        publishVideo)

videoRouter.route("/:videoId")
    .get(getVideobyId)


export default videoRouter