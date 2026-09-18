import mongoose, { Schema } from "mongoose";
import mongoose4 from "mongoose";
import { type } from "node:os";

const commentSchema = new Schema({
  content:{
    type:String,
    requiredL:true
  },
  video:{
    type:Schema.Types.ObjectId,
    ref:"video"
  },
   owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
   }

},

{timestamps:true})

export const comment = mongoose.model("comment",commentSchema)