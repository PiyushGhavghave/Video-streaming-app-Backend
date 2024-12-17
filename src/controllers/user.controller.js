import {User} from '../models/users.models.js'
import {asyncHandler} from '../utils/asyncHandler.js'
import {apiError} from '../utils/apiError.js'
import {apiResponse} from '../utils/apiResponse.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import fs from 'fs'

// extract the details from frontend
// extract image local path, check for avatar local path (else unlink files)
// check for Validation - not empty (else unlink files)
// check if user already exist - username , email (else unlink files)
// upload image to cloudinary
// create user object 
// remove password , refreshtoken from the response
// check for the user creation
// return response

const registerUser = asyncHandler( async (req, res) => {
    // extract the details from frontend
    const {username, email, fullname, password} = req.body;
    
    // extract image local path, check for avatar local path (else unlink files)
    let avatarLocalPath;
    if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
        avatarLocalPath = req.files.avatar[0].path;
    }
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if(!avatarLocalPath){
        if(coverImageLocalPath){
            fs.unlinkSync(coverImageLocalPath)
        }
        throw new apiError(400, "Avatar is requierd")
    }

    // check for Validation - not empty (else unlink files)
    if([username, email, fullname, password].some((field) => field?.trim() === "")){
        fs.unlinkSync(avatarLocalPath)
        if(coverImageLocalPath){
            fs.unlinkSync(coverImageLocalPath)
        }
        throw new apiError(400, "All fields are required");
    }

    // check if user already exist - username , email (else unlink files)
    const userExist = await User.findOne({
        $or : [{ username: username }, { email: email }]
    })
    if(userExist){
        fs.unlinkSync(avatarLocalPath)
        if(coverImageLocalPath){
            fs.unlinkSync(coverImageLocalPath)
        }
        throw new apiError(400, "User already exist")
    }

    // upload image to cloudinary, check if avatar is uploaded
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new apiError(400, "Avatar file is required... please try uploading again")
    }
    
    // create user object 
    const user =  await User.create({
        username : username.toLowerCase(),
        email : email,
        fullname : fullname,
        password : password,
        avatar : avatar.url,
        coverimage : coverImage? coverImage?.url : "",
    })

    // remove password , refreshtoken from the response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // check for the user creation
    if(!createdUser){
        throw new apiError(500, "Something went wrong while creating user")
    }

    // return response
    res.status(200).json(
        new apiResponse(200, createdUser, "User created successfully!")
    )
})

const loginUser = asyncHandler( async (req, res) => {
    // extract details
    // validation - check empty
    // find the user in databse - username or email
    // check for password
    // genarte access and refresh token and save refresh token
    // remove password and refrshtoken from response
    // send secure cookie 

    const {username, email, password} = req.body

    if(!username && !email){
        throw new apiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or : [{username : username}, {email : email}]
    })
    if(!user){
        throw new apiError(404, "User does not exist");
    }

    const isValidPassword = await user.validatePassword(password);
    if(!isValidPassword){
        throw new apiError(400, "User credentials are invalid")
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave : false})

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly : true,
        secure : true
    }
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200,
            {
                user : loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {refreshToken : null}
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new apiResponse(200, {}, "User logged out successfully")
    )
})

export {registerUser, loginUser, logoutUser}