import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {Apierror} from "../utils/Apierror.js"
import {Apires} from "../utils/Apires.js"
import {asynchandler} from "../utils/asynchandler.js"

const createTweet = asynchandler(async (req, res) => {
  const {content}=req.body;
  if(!content){
    throw new Apierror(400,"found nothing ")
  }
   const tweet= await Tweet.create({
    content,
    owner:req.user._id,
   });
   if(!tweet){
    throw new Apierror(500,"something went wrong while creating the tweet")
   }
   return res
   .status(201)
   .json(new Apires(201,tweet,"Tweet created succesfully"))

})

const getUserTweets = asynchandler(async (req, res) => {

   
})

const updateTweet = asynchandler(async (req, res) => {
    const {tweetId}=req.body;
    if(!tweetId){
        throw new Apierror(400,"no such tweet exist ");
    }
    const userexist= await Tweet.findById(tweetId)

    if(userexist.owner.toString() !== req.user._id.toString()){
        throw new Apierror(400,"only owner can updaet tweets")
    }
    const updated=await Tweet.findByIdAndUpdate( 
        tweetId,
    {$set:{content}},
    {new:true})
     return res
     .status(200)
     .json(new Apires(200,{updated},"succesfully updated the tweet"))
})

const deleteTweet = asynchandler(async (req, res) => {
    const {tweetId} = req.params;
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new Apierror(400,"tweet id not found ");
    }
    if(tweet.owner.toString()!=req.user._id.toString()){
        throw new Apierror(402,"both ids are not matching and you can only delete your own tweet")
    }
    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(new Apires(200,{},"The asked tweet is deleted "));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}