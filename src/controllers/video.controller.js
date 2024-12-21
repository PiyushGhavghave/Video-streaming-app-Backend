import { Video } from "../models/video.models.js";
import {asyncHandler} from '../utils/asyncHandler.js'
import {apiError} from '../utils/apiError.js'
import {apiResponse} from '../utils/apiResponse.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler( async (req, res) => {
    const {page =1 , limit = 10, query, sortBy = 'createdAt', sortType = -1} = req.query;
    const skip = (page - 1) * limit

    const searchQuery = query
    ? {
        isPublished : true,
        $or : [
            {title : { $regex: query, $options: 'i' }},
            {description : { $regex: query, $options: 'i' }}
        ]
    }
    : {isPublished : true}

    const videos = await Video.find(searchQuery)
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy] : Number(sortType) })
    
    if(!videos?.length){
        throw new apiError(404, "No videos found")
    }
    return res.status(200)
    .json(
        new apiResponse(200, videos, "Videos fetched successfully")
    )
})


export {getAllVideos}