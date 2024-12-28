import { Comment } from "../models/comment.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const postComment = asyncHandler(async (req, res) => {
    const {content, videoID} = req.body
    if(!videoID){
        throw new apiError(400, "Video Id is required")
    }
    if(!content.trim()){
        throw new apiError(400, "Content can't be empty")
    }

    const comment = await Comment.create({
        content : content,
        video : videoID,
        owner : req.user?._id
    })
    if(!comment){
        throw new apiError(400, "something went wrong while posting comment")
    }

    return res.status(200)
    .json(
        new apiResponse(200, comment, "Comment posted successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const {content, commentID} = req.body
    if(!commentID){
        throw new apiError(400, "Comment id is required")
    }
    if(!content.trim()){
        throw new apiError(400, "Content can't be empty")
    }

    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id : commentID,
            owner : req.user?._id
        },
        {
            $set : {
                content : content
            }
        },
        {
            new : true
        }
    )
    if(!updatedComment){
        throw new apiError(400, "unauthorized access")
    }

    return res.status(200)
    .json(
        new apiResponse(200, updatedComment, "Comment updated successfully")
    )
})

export {
    postComment,
    updateComment,
}