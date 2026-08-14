import { User } from "../models/user.model.js";
import { Apierror } from "../utils/Apierror.js";

import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT=asynchandler(async(req,res,next)=>{
   
    try {
        const token=req.cookies?.accessToken || req.header
        ("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new Apierror(401,"Unauthorised request")
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
       
        const user=await User.findById(decodedToken?._id).
        select("-password -refreshTokens")
    
         if(!user){
            throw new Apierror(401,"Invalid Access Token")
         }
    
         req.user=user;
         next()
    } catch (error) {
        throw new Apierror(401,"invalid token")
    }
})