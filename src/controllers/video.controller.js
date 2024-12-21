import { Video } from "../models/video.models.js";
import {asyncHandler} from '../utils/asyncHandler.js'
import {apiError} from '../utils/apiError.js'
import {apiResponse} from '../utils/apiResponse.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";

import fs from 'fs'

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
                },
                score : {
                    $meta: "textScore"
                }
            }
        },
        {
            $sort : query? {score : -1} : {[sortBy] : Number(sortType)}
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
        new apiResponse(200, videos, "Videos fetched successfully")
    )
})


const unlinkVideo = (videoLocalPath, thumbnailLocalPath) => {
    if(videoLocalPath){
        fs.unlinkSync(videoLocalPath)
    }
    if(thumbnailLocalPath){
        fs.unlinkSync(thumbnailLocalPath)
    }
}
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


export {
    getAllVideos,
    publishVideo,
}