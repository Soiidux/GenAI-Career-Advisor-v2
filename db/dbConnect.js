import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI=process.env.MONGO_URI;
export const dbConnect = async ()=>{
    try{
        mongoose
            .connect(MONGO_URI)
            .then(()=>{
                console.log("Connected to mongodb.")
            })
            .catch((error)=>{
                console.log(`Error occured while connecting to database: ${error}`)
            });
        }
    catch(error){
    console.log(`Error connecting to database: ${error}`);
    }
}
