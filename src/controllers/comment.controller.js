import mongoose, { isValidObjectId } from "mongoose"
import {comment} from "../models/comment.model.js"
import {Apierror} from "../utils/Apierror.js"
import {Apires} from "../utils/Apires.js"
import {asynchandler} from "../utils/asynchandler.js"

const getVideoComments = asynchandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId)){
        throw new Apierror(400,"Invalid video id")
    }

    const comments = await comment.find({ video: videoId })
        .populate("owner", "username avatar")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))

    const totalComments = await comment.countDocuments({ video: videoId })

    return res
    .status(200)
    .json(new Apires(200, { comments, totalComments, page: parseInt(page), limit: parseInt(limit) }, "Comments fetched successfully"))
})

const addComment = asynchandler(async (req, res) => {
    const {content} =req.body
    const {videoId}=req.params

    if(!content){
        throw new Apierror(400,"Comment content is required");
    }
    if(!isValidObjectId(videoId)){
        throw new Apierror(400,"Invalid video id");
    }
    const newcomment = await comment.create({
        content,
        video:videoId,
        owner:req.user._id,
    })
    if(!newcomment){
        throw new Apierror(500,"Comment not created");
    }

    return res
    .status(201)
    .json(new Apires(201, newcomment, "Comment added successfully"))
})

const updateComment = asynchandler(async (req, res) => {
   const {commentId} = req.params
   const {content} =req.body

   if(!isValidObjectId(commentId)){
    throw new Apierror(400,"Invalid comment id")
   }
   if(!content){
    throw new Apierror(400,"Content is required to update")
   }
   const existingComment = await comment.findById(commentId)
   
   if(!existingComment){
    throw new Apierror(404,"Comment not found");
   }
   if(existingComment.owner.toString() !== req.user._id.toString()){
    throw new Apierror(403,"Only the owner can update the comment");
   }
   const updatedComment = await comment.findByIdAndUpdate(
    commentId,
    {$set:{content}},
    {new:true}
   )
    return res
    .status(200)
    .json(new Apires(200, updatedComment, "Comment updated successfully"))
})


const deleteComment = asynchandler(async (req, res) => {
   const {commentId}= req.params
   if(!isValidObjectId(commentId)){
    throw new Apierror(400,"Invalid comment id");
   }
    const existingComment = await comment.findById(commentId)

    if(!existingComment){
        throw new Apierror(404,"Comment not found")
    }

    if(existingComment.owner.toString() !== req.user._id.toString()){
        throw new Apierror(403,"Only the owner can delete the comment");
    }

    await comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(new Apires(200, {}, "Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}