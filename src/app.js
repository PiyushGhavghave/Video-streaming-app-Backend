import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({
    limit:'20kb'
}))
app.use(express.static("public"))
app.use(express.urlencoded({
    extended : true,
    limit : '20kb'
}))

app.use(cookieParser())


// routes import
import userRouter from "./routes/user.router.js";
import videoRouter from './routes/video.router.js'
import subscriptionRouter from './routes/subscription.router.js'
import likesRouter from './routes/likes.router.js'
import commentRouter from './routes/comment.router.js'
import playlistRouter from './routes/playlist.router.js'


// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/subscription", subscriptionRouter)
app.use("/api/v1/likes",likesRouter)
app.use("/api/v1/comment", commentRouter)
app.use("/api/v1/playlist", playlistRouter)

export  {app};

