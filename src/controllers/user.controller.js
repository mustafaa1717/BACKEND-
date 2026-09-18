
import { asynchandler } from "../utils/asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { Apires } from "../utils/Apires.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndReffereshToken= async(userId)=>{

  try {
       const user= await User.findById(userId);
       const accesToken=user.generateAccessToken()
       const reffereshToken=user.generateRefreshToken()

       user.refreshTokens=reffereshToken
       await user.save({validateBeforeSave:false})

       return {reffereshToken,accesToken};
  } catch (error) {
    throw new Apierror(500,`someting went wrong while generating refferesh tok
      and access token`)
  }
}


const registeruser=asynchandler(async(req,res)=>{


    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

  const{fullname,username,email,password}=req.body
  console.log(email);

  if(!fullname || fullname.trim() === ""){
    throw new Apierror(400,"fullname field is required")
  }
  if(!username || username.trim() === ""){
    throw new Apierror(400,"username field is required")
  }
  if(!email || email.trim() === ""){
    throw new Apierror(400,"email field is required")
  }
  if(!password || password.trim() === ""){
    throw new Apierror(400,"password field is required")
  }

  const existedUser=await User.findOne({
    $or:[{username},{email}]
  })
   if (existedUser) {
    throw new Apierror(409,"User already existed in the system ")
   }

    const avatarlocalpath = req.files?.avatar?.[0]?.path;
    const coverImagelocalpath = req.files?.coverImage?.[0]?.path;
    if(!avatarlocalpath){
        throw new Apierror(400,"avatar file not found");
    }

    if(!coverImagelocalpath){
        throw new Apierror(400,"cover image file not found");
    }
     const avatar= await uploadOnCloudinary(avatarlocalpath)
     const coverImage= await uploadOnCloudinary(coverImagelocalpath)
     if(!avatar){
         throw new Apierror(400,"avatar file not found");
     }

    const user = await User.create({
    username,
    email,
    fullname,
    avatar: avatar.url,
    coverImage: coverImage.url,
    password
});
     const createduser=await User.findById(user._id).select(
        "-password -refreshTokens"
     )
     if(!createduser){
        throw new Apierror(500,"something got wrong while rigistering the user")
     }
     return res.status(201).json(
      new Apires(200,createduser,"USER REGISTERED SUCCESFULLY")
     )
})
//same as reggister user the algorithm may differ but the way of doing things
//and following sequence remains same
const loginuser=asynchandler(async(req,res)=>{
//req body se data lao
//username or email 
//find the user
//password check
//if password is wrong then return err
//access and refresh tokens
//send cookies
//confirmation of login
///****************************\\\
//data le liya body se
const {username,email,password}=req.body;

//check lagao
if(!(username || email)){
   throw new Apierror(400,"username of email is required")
}

//database me khojo user
//User mongo db refference 
//and the user that we have wrapped up on the mongo db user now if we 
//want to get something done in the backend then we will use this user
const user=await User.findOne({
  $or:[{username},{email}]
})
if(!user){
  throw new Apierror(404,"user does not exist");
}
//password check

 const ispasswordValid=await user.isPasswordCorrect(password)

 if(!ispasswordValid){
  throw new Apierror(401,"invalid user credentials")
 }

 //access and refresh tokens generation
  const {accesToken,reffereshToken}=await generateAccessTokenAndReffereshToken(user._id)
//in previous user you dont have refferesh token as we have created it after words

//will call user one more time to get the refferesh token now

  const loggedInuser=await User.findById(user._id).
  select("-password -refreshTokens")

  const options={
    httpOnly:true,
    secure:true
  }

  return res
  .status(200)
  .cookie("accessToken",accesToken,options)
  .cookie("reffereshToken",reffereshToken,options)
  .json(
    new Apires(
      200,
      {
        user:loggedInuser,accesToken,reffereshToken
      },
      "LOGGED IN SUCCESFULLY"
    )
  )
})

const logoutuser=asynchandler(async(req,res)=>{
   await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset:{
        refreshTokens:1
      }
    },
    {
      new:true
    }
   )
     const options={
    httpOnly:true,
    secure:true
  }
  return res
  .status(200)
  .clearCookie("accessToken",options)
   .clearCookie("reffereshToken",options)
   .json(new Apires(200,{},"logged out succesfully "))
})

const reffereshAccessToken=asynchandler(async(req,res)=>{
  const increffereshToken=req.cookies?.reffereshToken ||
  req.body?.reffereshToken

  if(!increffereshToken){
    throw new Apierror(400,"unauthorised request")
  }
  
  const decodedToken=jwt.verify(
    increffereshToken,process.env.REFRESH_TOKEN_SECRET
  )
 const user= await User.findById(decodedToken?._id)
 if(!user){
  throw new Apierror(401,"invalid refferesh token")
 }

 if(increffereshToken !== user?.refreshTokens){
  throw new Apierror(402,"reffersh token is expired")
 }

 const options={
  httpOnly:true,
  secure:true
 }

 const {accesToken,reffereshToken}= await generateAccessTokenAndReffereshToken(user._id)

 return res
 .status(200)
 .cookie("accessToken",accesToken,options)
 .cookie("reffereshToken",reffereshToken,options)
 .json(
  new Apires(
    200,
    {accesToken,reffereshToken},
    "access token reffereshed succesfully"
  )
 )
})

const changePassword=asynchandler(async(req,res)=>{
  const {oldpassword,newpassword,confpassword}=req.body
  
  if(!(newpassword === confpassword)){
    throw new Apierror(400,"the passowrd is not matching with the new one")
  }

  const user=await User.findById(req.user?._id)
   
 const isPasswordCorrect= user.isPasswordCorrect(oldpassword)

 if(!isPasswordCorrect){
  throw new Apierror(401,"the old password is not correct")
 }
  user.password=newpassword
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(new Apires(200,{},"password is changed succesfully"))

})

const getcurrentuser=asynchandler(async(req,res)=>{
  return res
  .status(200)
  .json(new Apires(200,req.user," current user fetched succesfully"))
})

const updateAccount=asynchandler(async(req,res)=>{
  const{fullname,email}=req.body

  if(!(username || email)){
    throw new Apierror(400,"invalid username or email")
  }
   
  const user=User.findByIdAndUpdate(req.user?._id,
    {
   $set:{
      fullname:fullname,
      email:email
   }
    },
    {
      new:true 
    }
  ).select("-password")

  return res
  .status(200)
  .json(new Apires(200,user,"account details updated succesfully"))


})

const updateAvatar=asynchandler(async(req,res)=>{
  const avatarpath=req.file?.path

  if(!avatarpath){
    throw new Apierror(404,"invalid avatar path")
  }
    const avatar = await uploadOnCloudinary(avatarpath)
  
    if(!avatar.url){
      throw new Apierror(406,"invalid url of avatar ")
    }

    const user=await User.findByIdAndUpdate(req.user._id,
      {
        $set:{
          avatar:avatar.url
        }
      },
      {
        new:true
      }
    ).select("-password")
  return res
  .status(200)
  .json(new Apires(200,user,"avatar is updated succesfully"))
})

const updateCoverimage= asynchandler(async(req,res)=>{
  const coverimagepath=req.file?.path

  if(!coverimagepath){
    throw new Apierror(400,"invalid path for cover image")
  }

  const coverImage=await uploadOnCloudinary(coverimagepath)
  
  if(!coverImage){
     throw new Apierror(400,"invalid path for cover image")
  }
  //update karde ab to sab sahi chal raha hai

  const user=await User.findByIdAndUpdate(req.user?._id,
    {
      $set:{
        coverImage:coverimage.url
      }
    },
    {
      new:true
    }
  ).select("-password")

   return res
  .status(200)
  .json(new Apires(200,user,"coverimage  is updated succesfully"))
})


export {registeruser,loginuser,logoutuser,reffereshAccessToken,changePassword
  ,getcurrentuser,updateAvatar,updateCoverimage
}