import { Router } from "express";
import { 
    toggleSubscription 
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const subscriptionRouter = Router()
subscriptionRouter.use(verifyJWT)

subscriptionRouter.route("/c/:channelID").post(toggleSubscription)


export default subscriptionRouter