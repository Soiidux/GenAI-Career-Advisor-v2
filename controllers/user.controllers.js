import User from '../db/user.model.js';
import Conversation from '../db/conversation.model.js';
import dotenv from 'dotenv';
import generativeModel from '../utils/genai.js';
import { generateHistorySummary , buildChatPrompt , buildOnboardingPrompt, generateConversationAnalysis } from '../utils/conversation.utils.js';
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

export const startConversation = async (req, res) => {
    try {
        const user = await User.findOne({});
        if (!user) {
            return res.status(404).json({ message: 'Demo user profile not found.' });
        }

        const newConversation = await Conversation.create({
            userId: user._id,
            history: [],
            title: "New Conversation" // Set a default title
        });

        // Send the new ID back to the frontend
        res.status(201).json({ 
            conversationId: newConversation._id,
            success:true
        });

    } catch (error) {
        console.error("Error starting conversation:", error);
        res.status(500).json({ 
            message: 'Could not create new conversation.',
            success: false
        });
    }
};


export const postChatMessageWithHistory = async (req, res) => {
    try {
        const { conversationId, message } = req.body;

        if (!conversationId || !message) {
            return res.status(400).json({ message: 'conversationId and message are required.' });
        }

        const profile = await User.findOne({});
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found.' });
        }

        // Add user's message to history
        conversation.history.push({ role: 'user', content: message });
        
        let prompt;
        // Check the isNewUser flag to decide which prompt to use
        if (profile.isNewUser) {
            prompt = buildOnboardingPrompt(profile,message);
            profile.isNewUser = false; // Flip the flag after the first message
            await profile.save();
        } else {
            const recentHistory = conversation.history.slice(-10);
            prompt = buildChatPrompt(profile, recentHistory, message);
        }
        
        const resp = await generativeModel.generateContent(prompt);
        const aiResponse = resp.response.candidates[0].content.parts[0].text;

        // Add AI's response to history
        conversation.history.push({ role: 'model', content: aiResponse });
        await conversation.save();

        res.status(200).json({ reply: aiResponse });

    } catch (error) {
        console.error("Error in chat message controller:", error);
        res.status(500).json({ message: 'Error processing your message.' });
    }
};


export const postChatMessageWithChatSummary = async (req, res) => {
    try {
        const { conversationId, message } = req.body;

        if (!conversationId || !message) {
            return res.status(400).json({ message: 'conversationId and message are required.' });
        }

        const profile = await User.findOne({});
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found.' });
        }

        // Add user's message to history
        conversation.history.push({ role: 'user', content: message });
        
        let prompt;
        // Check the isNewUser flag to decide which prompt to use
        if (profile.isNewUser) {
            prompt = buildOnboardingPrompt(profile,message);
            profile.isNewUser = false; // Flip the flag after the first message
            await profile.save();
        } else {
            const recentHistory = await generateHistorySummary(conversation.history);
            prompt = buildChatPrompt(profile, recentHistory, message);
        }
        
        const resp = await generativeModel.generateContent(prompt);
        const aiResponse = resp.response.candidates[0].content.parts[0].text;

        // Add AI's response to history
        conversation.history.push({ role: 'model', content: aiResponse });
        await conversation.save();

        res.status(200).json({ reply: aiResponse });

    } catch (error) {
        console.error("Error in chat message controller:", error);
        res.status(500).json({ message: 'Error processing your message.' });
    }
};

export const endConversation = async (req, res) => {
    try {
        const user = await User.findOne({});
        const { conversationId } = req.body;
        const conversation = await Conversation.findById(conversationId);
        // --- Validation Block ---

        // 1. Check if the demo user profile exists at all.
        if (!user) {
            return res.status(404).json({ message: "Primary user profile not found in the database." });
        }

        // 2. Check if a conversationId was actually sent in the request body.
        if (!conversationId) {
            return res.status(400).json({ message: "conversationId is required in the request body." });
        }

        // 3. Check if the conversationId corresponds to a real conversation.
        if (!conversation) {
            return res.status(404).json({ message: `Conversation with ID ${conversationId} not found.` });
        }

        // 4. (Optional but good) Check if the conversation is empty.
        if (conversation.history.length === 0) {
            return res.status(200).json({ message: "Conversation ended with no new summary, as it was empty." });
        }

        // 1. Make a SINGLE call to the AI for all analysis
        const analysis = await generateConversationAnalysis(user.aiConversationSummary, conversation.history);

        // 2. Update the documents in memory (this is synchronous and fast)
        conversation.summary = analysis.summary;
        conversation.title = analysis.title;
        user.aiConversationSummary = analysis.updatedMasterSummary;
        user.aiCareerAnalysis = analysis.aiCareerAnalysis;
        user.aiCareerAnalysis = JSON.stringify(analysis.aiCareerAnalysis, null, 2);
        // 3. Save both documents to the database in parallel
        await Promise.all([
            conversation.save(),
            user.save()
        ]);

        res.status(200).json({ 
            message: "Conversation and user profile updated successfully.",
            summary: analysis.summary 
        });

    } catch (error) {
        console.error("Error ending conversation:", error);
        res.status(500).json({ message: 'Error generating summary.' });
    }
};

export const getProfile = async (req, res) => {
    try {
        // Find the first (and only) user document in the collection.
        const profile = await User.findOne({});

        if (!profile) {
            // This happens if the database has not been seeded yet.
            return res.status(404).json({ message: "Profile not found. Please seed the database." });
        }

        // Send the complete profile object back to the frontend.
        res.status(200).json(profile);

    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Server error while fetching profile." });
    }
};

export const getConversations = async (req, res) => {
    try {
        // Find all conversations and sort them with the newest first.
        // .select() is an optimization that only fetches the fields we need.
        const conversations = await Conversation.find({})
            .sort({ createdAt: -1 })
            .select('title summary createdAt'); // Only get these fields

        res.status(200).json(conversations);

    } catch (error) {
        console.error("Error fetching conversation history:", error);
        res.status(500).json({ message: "Server error while fetching history." });
    }
};