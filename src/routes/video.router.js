import {Router} from "express"
import { 
    getAllVideos,
    publishVideo,
    getVideobyId,
    updateVideo,
    deleteVideo,
    toggleIsPublished
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
    .patch(verifyJWT, upload.single("thumbnail"), updateVideo)
    .delete(verifyJWT, deleteVideo)

videoRouter.route("/:videoId")
    .get(getVideobyId)

videoRouter.route("/toggle-publish")
    .patch(verifyJWT, toggleIsPublished)

export default videoRouter