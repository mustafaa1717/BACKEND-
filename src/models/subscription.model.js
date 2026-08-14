import { Schema } from "mongoose";
import mongoose from "mongoose";
import { type } from "node:os";

const subscriptionSchema= new Schema({
 subscriber:{
    type:Schema.Types.ObjectId,
    ref:"User"
 },
  channel:{
  type:Schema.Types.ObjectId,
    ref:"User"
  }
},
{timestamps:true})



export const Subscription= mongoose.model("Subscription",subscriptionSchema)
