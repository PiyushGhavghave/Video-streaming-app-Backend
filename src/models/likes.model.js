import mongoose,{Schema} from "mongoose";

const likesSchema = new Schema({
    video : {
        type : Schema.Types.ObjectId,
        ref : "Video"
    },
    likedBy : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    isLike : {
        type : Boolean,
        default : true
    }
}, {timestamps : true})

export const Like = mongoose.model("Like", likesSchema)