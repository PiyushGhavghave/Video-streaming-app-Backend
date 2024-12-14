import {v2 as cloudinary} from 'cloudinary'
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
        // fs.unlink(loacalFilePath, (err) => {
        //     if (err) throw err;
        //     console.log(`${loacalFilePath} deleted from server`);
        // })

        console.log("File has been uploaded successfully", response.url)
        return response
    } catch (error) {
        fs.unlinkSync(loacalFilePath) // remove the locally saved temporary file as upload got failed

        console.error("File upload Failed : ",error)
        return null;
    }
}

export {uploadOnCloudinary}