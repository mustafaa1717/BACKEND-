import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
const app=express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import 
import userRouter from "./routes/user.routes.js"
app.use("/api/v1/users",userRouter)


//error handler
app.use((err,req,res,next)=>{
    const statusCode=err.statusCode || 500
    const message=err.message || "something went wrong"
    return res.status(statusCode).json({
        success:false,
        statusCode,
        message,
        errors:err.errors || []
    })
})

export {app}