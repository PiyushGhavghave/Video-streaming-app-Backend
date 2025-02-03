import { Playlist } from "../models/playlist.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createPlaylist = asyncHandler(async (req, res) => {
    const {name , description, videoID} = req.body;
    if(!name || !name.trim()){
        throw new apiError(400, "Playlist name is required");
    }
    
    const playlist = await Playlist.create({
        name : name,
        description : description,
        videos : videoID || [],
        owner : req.user?._id,
    })
    if(!playlist){
        throw new apiError(400, "Something went wrong while creating playlist")
    }

    return res.status(200)
    .json(
        new apiResponse(200, playlist, "Playlist created successfully!")
    )

})

export {
    createPlaylist
}