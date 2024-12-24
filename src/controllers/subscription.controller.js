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

export {
    toggleSubscription
}