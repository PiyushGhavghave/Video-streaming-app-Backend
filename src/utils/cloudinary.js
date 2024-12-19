import dotenv from 'dotenv'
dotenv.config()
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//create function to upload file.... then unlink(delete) from server
const uploadOnCloudinary = async (loacalFilePath) => {
    try {
        if(!loacalFilePath) return null;

        //Upload file
        const response = await cloudinary.uploader.upload(loacalFilePath, {
            resource_type : 'auto'
        })

        // remove the locally saved temporary file
        fs.unlinkSync(loacalFilePath)
        
        return response
    } catch (error) {
        // remove the locally saved temporary file as upload got failed
        fs.unlinkSync(loacalFilePath)

        console.error("File upload Failed : ",error)
        return null;
    }
}

const deleteFromCloudinary = async (imageURL) => {
    try {
        if(!imageURL) return;

        const publicID = imageURL.split('/').slice(-1)[0].split('.')[0]

        await cloudinary.uploader.destroy(publicID)

    } catch (error) {
        console.error("Error while deleteing the file", error)
    }
}

export {uploadOnCloudinary, deleteFromCloudinary}