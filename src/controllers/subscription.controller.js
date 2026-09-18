import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {Apierror} from "../utils/Apierror.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asynchandler} from "../utils/asynchandler.js"
import { subscribe } from "node:diagnostics_channel"
import { Apires } from "../utils/Apires.js"


const toggleSubscription = asynchandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new Apierror(400,"no such id exists")
    }
    const existuser=await Subscription.findOne({
        subscriber:req.user._id,
        channel:channelId
    }
    )
    if(existuser){
        await Subscription.findByIdAndDelete(existuser);
        return res.status(200).json(new Apires(200,{},"unsubscribed"))
    }
    const newuser=await Subscription.create({
        subscriber:req.user._id,
        channel:channelId
    })
    return res.status(200).json(new Apires(200,{newuser},"subscribed"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asynchandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new Apierror(200,"no such subscriber found")
    }
    const subscriber=await Subscription.find({channel:channelId})
    .populate("subscriber","username fullname avatar")

    return res
    .status(200)
    .json(new Apires(200,{subscriber,count:subscriber.length},"subscriber fetched succesfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asynchandler(async (req, res) => {
    const { subscriberId } = req.params
     if(!isValidObjectId(subscriberId)){
        throw new Apierror(200,"no such channel found")
    }
    const channels= await Subscription.find({subscriber:subscriberId})
    .populate("channel","channal avatar")

    return res
    .status(200)
    .json(new Apires(200,{channels,count:channels.length},"channels that have been subscribed"))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}