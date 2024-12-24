import { Router } from "express";
import { 
    toggleSubscription,
    getChannelSubscriberList
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const subscriptionRouter = Router()
subscriptionRouter.use(verifyJWT)

subscriptionRouter.route("/c/:channelID")
    .post(toggleSubscription)
    .get(getChannelSubscriberList)


export default subscriptionRouter