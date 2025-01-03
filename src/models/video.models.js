import mongoose,{Schema} from "mongoose";

const videoSchema = new Schema({
    videoFile : {
        type : String,   //cloudanary url
        required : true
    },
    thumbnail : {
        type : String,   //cloudanary url
        required : true
    },
    title : {
        type : String,
        required : true
    },
    description : {
        type : String, 
        required : true
    },
    duration : {
        type : Number, 
        required : true
    },
    views : {
        type : Number,
        default : 0,
    },
    isPublished : {
        type : Boolean,
        default : true,
    },
    owner: {
        type : Schema.Types.ObjectId,
        ref : "User"
    }
}, {timestamps :true})

videoSchema.index({title : "text", description : "text"})

export const Video = mongoose.model("Video", videoSchema)