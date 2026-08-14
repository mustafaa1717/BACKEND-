import { app } from "./app.js";
import dotenv from "dotenv"
import connectDb from "./db/db.js";
dotenv.config({
  path: './.env'
})


connectDb()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
      console.log(`server is running at ${process.env.PORT}`);
    })
})
.catch((err)=>{
  console.log("FOUND ERROR WHILE CONNECTING TO MONGO");
})











/*
import express from "express"
import { error } from "node:console";
const app = express()

(async()=>{
  try {
   await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
   app.on("error",()=>{
    console.log("ERROR:",error);
    throw error;
   })
   app.listen(process.env.PORT,()=>{
    console.log("listening");
   })
  } catch (error) {
    console.log("ERROR: ",error);
  }
})()*/