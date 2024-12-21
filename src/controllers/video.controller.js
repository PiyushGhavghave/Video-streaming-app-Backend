import { Video } from "../models/video.models.js";
import {asyncHandler} from '../utils/asyncHandler.js'
import {apiError} from '../utils/apiError.js'
import {apiResponse} from '../utils/apiResponse.js'
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

import fs from 'fs'
import mongoose from "mongoose";
const unlinkVideo = (videoLocalPath, thumbnailLocalPath) => {
    if(videoLocalPath){
        fs.unlinkSync(videoLocalPath)
    }
    if(thumbnailLocalPath){
        fs.unlinkSync(thumbnailLocalPath)
    }
}
const getVideobyId = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    const video = await Video.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(videoId),
                isPublished : true,
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "owner",
                foreignField : "_id",
                as : "owner",
                pipeline : [
                    {
                        $project : {
                            username : 1,
                            fullname : 1,
                            avatar : 1
                        }
                    }
                ]
            }
        },
        {
            $addFields : {
                owner : {
                    $first : "$owner"
                }
            }
        }
    ])

    if(!video?.length){
        throw new apiError(404, "Video doesn't exist or it is private")
    }

    res.status(200)
    .json(
        new apiResponse(200, video[0], "video fetched successfully")
    )
})



const getAllVideos = asyncHandler( async (req, res) => {
    const {page =1 , limit = 10, query, sortBy = 'createdAt', sortType = -1} = req.query;
    const skip = (page - 1) * limit

    const searchQuery = query
    ? {
        isPublished : true,
        $text :  { $search: query }
    }
    : {isPublished : true}

    const videos = await Video.aggregate([
        {
            $match : searchQuery
        },
        {
            $lookup : {
                from : "users",
                localField : "owner",
                foreignField : "_id",
                as : "owner",
                pipeline : [
                    {
                        $project : {
                            username : 1,
                            fullname : 1,
                            avatar : 1
                        }
                    }
                ]
            }
        },
        {
            $addFields : {
                owner : {
                    $first : "$owner"
                }
            }
        },
        {
            $sort : query? { score: { $meta: "textScore" } } : {[sortBy] : Number(sortType)}
        },
        {
            $skip : skip
        },
        {
            $limit : Number(limit)
        }
    ])

    
    if(!videos?.length){
        throw new apiError(404, "No videos found")
    }
    return res.status(200)
    .json(
        new apiResponse(200, videos, "All Videos fetched successfully")
    )
})

const publishVideo = asyncHandler(async (req, res) => {
    const {title, description, isPublished = true} = req.body

    let videoLocalPath;
    if(req.files && Array.isArray(req.files.video) && req.files.video.length > 0){
        videoLocalPath = req.files.video[0].path
    }
    let thumbnailLocalPath;
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0){
        thumbnailLocalPath = req.files.thumbnail[0].path
    }
    if(!(videoLocalPath && thumbnailLocalPath)){
        unlinkVideo(videoLocalPath, thumbnailLocalPath)
        throw new apiError(400, "Video file and thumbnail file are required")
    }

    if(!(title.trim() && description.trim())){
        unlinkVideo(videoLocalPath, thumbnailLocalPath)
        throw new apiError(400, "title and description are required")
    }

    const video = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!(video && thumbnail)){
        throw new apiError(500, "Something went wrong while uploading video and thumbnail")
    }

    const newVideo = await Video.create({
        title : title,
        description : description,
        videoFile : video.url,
        thumbnail : thumbnail.url,
        duration : video.duration,
        isPublished : isPublished,
        owner : req.user._id,
    })

    res.status(200)
    .json(
        new apiResponse(200, newVideo, "Video uploaded successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const {title, description, videoId} = req.body
    const thumbnailLocalPath = req.file?.path
    if(!(title && description && videoId)){
        unlinkVideo(_ , thumbnailLocalPath)
        throw new apiError(400, "Title, description and video_id are required")
    }

    const video = await Video.findOne({
        _id : videoId,
        owner : req.user._id,
    })
    if(!video){
        unlinkVideo(_, thumbnailLocalPath)
        throw new apiError(400, "Unauthorized access")
    }

    let thumbnail;
    if(thumbnailLocalPath){
        await deleteFromCloudinary(video.thumbnail)

        thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if(!thumbnail.url){
            throw new apiError(500, "Something went wrong while uploading thumbnail")
        }
    }

    if(thumbnail){
        video.thumbnail = thumbnail.url
    }
    video.title = title
    video.description = description
    await video.save({validateBeforeSave : false})

    return res.status(200)
    .json(
        new apiResponse(200, video, "Video details updated successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.body
    if(!videoId){
        throw new apiError(400, "VideoId is required")
    }

    const video = await Video.findOneAndDelete(
        {
            _id : videoId,
            owner : req.user._id,
        }
    )
    if(!video){
        throw new apiError(400,"Unauthorized access")
    }

    return res.status(200)
    .json(
        new apiResponse(200, video, "Video deleted successfully")
    )

})

const toggleIsPublished = asyncHandler(async (req, res) => {
    const {videoId} = req.body
    if(!videoId) {
        throw new apiError(400, "VideoId is required")
    }

    const video = await Video.findOneAndUpdate(
        {
            _id : videoId,
            owner : req.user._id,
        },
        [
            {
                $set : {
                    isPublished : { $not: "$isPublished" }
                }
            }
        ],
        {
            new :true
        }
    )
    if(!video){
        throw new apiError(400,"Unauthorized access")
    }

    return res.status(200)
    .json(
        new apiResponse(200, video, "Visibility toggled successfully")
    )
})

export {
    getVideobyId,
    getAllVideos,
    publishVideo,
    updateVideo,
    deleteVideo,
    toggleIsPublished
}