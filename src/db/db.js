import mongoose from "mongoose";


const connectDb= async()=>{
    try {
        
       const connectionInstance = await mongoose.connect(`${process.env.MONGO_URL}`)
       console.log(`MONGO DB CONNECTED:${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("ERROR CONNECTION FAILED : ",error);
        process.exit(1);
    }
}

export default connectDb