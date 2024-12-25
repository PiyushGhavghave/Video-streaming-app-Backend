import mongoose from "mongoose";
import { Like } from "../models/likes.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!videoId) {
        throw new apiError(400, "Video Id is required")
    }

    const videoLikeDoc = await Like.findOneAndDelete({
        video : videoId,
        likedBy : req.user._id
    })

    if(!videoLikeDoc){
        await Like.create({
            video : videoId,
            likedBy : req.user._id
        })

        return res.status(200)
        .json(
            new apiResponse(200, {}, "Video liked successfully")
        )
    }
    return res.status(200)
    .json(
        new apiResponse(200, {}, "Video disliked successfully")
    )
})

export {
    toggleVideoLike,
}