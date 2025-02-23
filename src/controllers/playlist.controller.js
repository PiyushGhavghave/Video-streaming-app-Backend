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
        throw new apiError(500, "Something went wrong while creating playlist")
    }

    return res.status(200)
    .json(
        new apiResponse(200, playlist, "Playlist created successfully!")
    )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistID} = req.params;
    const {name, description} = req.body;
    if(!playlistID){
        throw new apiError(400, "Playlist ID is required");
    }
    if(!name){
        throw new apiError(400, "Playlist name is required");
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id : playlistID,
            owner : req.user?._id
        },
        {
            $set : {
                name : name,
                description : description,
            }
        },
        {new : true}
    )
    if(!updatePlaylist){
        throw new apiError(500, "Something went wrong while updating playlist")
    }

    return res.status(200)
    .json(
        new apiResponse(200, updatedPlaylist, "Playlist updated successfully")
    )
    
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistID} = req.params;
    const {videoID} = req.body;
    if(!playlistID){
        throw new apiError(400, "Playlist ID is required");
    }
    if(!videoID){
        throw new apiError(400, "video ID is required");
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id : playlistID,
            owner : req.user?._id
        },
        {
            $push : {videos : videoID}
        },
        {
            new : true
        }
    )
    if(!updatedPlaylist){
        throw new apiError(500, "Something went wrong while adding video into playlist")
    }

    return res.status(200)
    .json(
        new apiResponse(200, updatedPlaylist, "video added successfully")
    )

})

export {
    createPlaylist,
    updatePlaylist,
    addVideoToPlaylist,
}