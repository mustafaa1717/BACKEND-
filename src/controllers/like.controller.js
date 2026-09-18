import mongoose, {isValidObjectId} from "mongoose"
import {like} from "../models/like.model.js"
import {Apierror, ApiError} from "../utils/Apierror.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asynchandler} from "../utils/asynchandler.js"
import { Apires } from "../utils/Apires.js"

const toggleVideoLike = asynchandler(async (req, res) => {
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new Apierror(400,"the video is invalid")
    }
    
    const existlike= await like.findOne({
        video:videoId,
        likedby:req.user._id
    })

    if(existlike){
        await like.findByIdAndDelete(existlike._id)
    }

    return res
    .status(200)
    .json(new Apires(200,{},"video like removed"))
})

const toggleCommentLike = asynchandler(async (req, res) => {
    const {commentId} = req.params
  if(!isValidObjectId(commentId)){
    throw new Apierror(400,"the comment is not valid")
  }

  const existed= await like.findOne({
    comment:commentId,
    likedby:req.user._id
  })

  if(existed){
    await like.findByIdAndDelete(existed._id)
  }

  return res
  .status
  .json(new Apires(200,{},"the comment like is removed"))

})

const toggleTweetLike = asynchandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
       throw new Apierror(400,"the tweet is not valid")  
    }

    const exist= await like.findOne({
        tweet:tweetId,
        likedby:req.user._id
    })

    if(exist){
        await like.findByIdAndDelete(exist._id)
    }

    return res
    .status(200)
    .json(new Apires(200,{},"the like has been removed from the tweet"))
}
)

const getLikedVideos = asynchandler(async (req, res) => {
     const likedVideos = await Like.find({
        likedBy: req.user._id,
        video: { $exists: true, $ne: null }
    }).populate("video")
    return res
        .status(200)
        .json(new Apires(200, likedVideos, "Liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}