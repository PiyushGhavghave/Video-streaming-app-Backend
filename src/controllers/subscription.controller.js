import mongoose from "mongoose";
import { Subscription } from "../models/subscription.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler( async (req, res) => {
    const {channelID} = req.params
    if(!channelID){
        throw new apiError(400, "Channel Id is  required")
    }

    const subscriberDoc = await Subscription.findOneAndDelete({
        subscriber : req.user._id,
        channel : channelID,
    })

    if(!subscriberDoc){
        await Subscription.create({
            subscriber : req.user._id,
            channel : channelID,
        })

        return res.status(200)
        .json(
            new apiResponse(200, {}, "Subscribed successfully")
        )
    }
    return res.status(200)
    .json(
        new apiResponse(200, {}, "Unsubscribed successfully")
    )
})

const getChannelSubscriberList = asyncHandler(async (req, res) => {
    const {channelID} = req.params

    const subscriberList = await Subscription.aggregate([
        {
            $match : {
                channel : new mongoose.Types.ObjectId(channelID)
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "subscriber",
                foreignField : "_id",
                as : "subscriber",
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
                subscriber : {
                    $first : "$subscriber"
                }
            }
        },
        {
            $project : {
                subscriber : 1
            }
        }
    ])
    
    res.status(200)
    .json(
        new apiResponse(200, subscriberList, "Subscribers list fetched successfully")
    )
})

export {
    toggleSubscription,
    getChannelSubscriberList
}