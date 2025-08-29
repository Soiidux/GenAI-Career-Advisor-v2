import User from '../db/user.model.js';
import Conversation from '../db/conversation.model.js';
import dotenv from 'dotenv';
import generativeModel from '../utils/genai.js';
dotenv.config();
const PROJECT_ID = process.env.PROJECT_ID;
const LOCATION = process.env.LOCATION;
const MODEL_NAME = process.env.MODEL_NAME;
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;



export const postProfile= async (req,res)=>{
    const userData = req.body;
    const errors = [];
    if(!userData.name){
        errors.push("Name is a required field.");
    }
    if(!userData.email){
        errors.push("Email is a required field.");
    }
    if(!userData.password){
        errors.push("Password is a required field.");
    }
    if(!userData.skills || userData.skills.length === 0){
        errors.push("Atleast one skill is required");
    }
    if (errors.length > 0) {
        // If there are any errors, send them all back
        return res.status(400).json({
            messages: errors ,
            success:false
        });
    }
    try {
        const existinguser = await User.findOne({email: userData.email})            //Check if user exists in db
        if (existinguser){
            return res.status(400).json({
                message: "user already exists",
                success: false
            })
        }

        const prompt = `You are a professional career analyst. Your task is to analyze the following JSON object, which contains 
        a user's profile data. Based on this data, write a concise, one-paragraph summary of the user's professional profile.
        The summary should be insightful and encouraging, highlighting their key strengths and potential career direction.
        **User Profile Data:**
        ${JSON.stringify(userData,null,2)}`
        const resp = await generativeModel.generateContent(prompt);
        const aiResponse = resp.response.candidates[0].content.parts[0].text;
        userData.userProfileSummary = aiResponse;

        const user = await User.create({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            skills: userData.skills,
            careerGoals: userData.careerGoals,
            experience: userData.experience,
            education: userData.education,
            userProfileSummary: aiResponse // Note: renamed from userProfileSummary to match your schema
        });
        console.log(user);

        res.status(201).json({
            message:"User registered successfully",
            success: true
        })
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            message:"User not registered successfully",
            success: false
        })
    }
}

