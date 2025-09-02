import dotenv from 'dotenv';
import generativeModel from './genai.js';
dotenv.config();

export const generateHistorySummary = async (fullHistory) => {
    // 1. Handle the case where history is empty to avoid errors.
    if (!fullHistory || fullHistory.length === 0) {
        return "No conversation history to summarize.";
    }

    // 2. Convert the history array into a clean, readable string transcript.
    const historyString = fullHistory.map(h => `${h.role}: ${h.content}`).join('\n\n');

    // 3. Create a clear and direct prompt for the AI.
    const prompt = `
        Based on the following conversation transcript, please write a concise, one-paragraph summary of the key topics discussed and the main advice given. The summary should be easy to understand for someone reviewing this chat later.

        **Transcript:**
        ${historyString}
    `;

    try {
        // 4. Call the Gemini API with the prompt.
        const resp = await generativeModel.generateContent(prompt);
        const summaryResponse = resp.response.candidates[0].content.parts[0].text;

        // 5. Return the clean text summary.
        return summaryResponse;

    } catch (error) {
        console.error("Error generating summary:", error);
        // Return a default message on failure so the app doesn't crash.
        return "Could not generate a summary for this conversation.";
    }
};


export function buildChatPrompt(profile, history,message) {
    let historyString;
    if(Array.isArray(history)){
        historyString = history.map(h => `${h.role}: ${h.content}`).join('\n');
    }
    else{
        historyString = history;
    }
    return `You are an expert career advisor for students in India. Your goal is to help the user based on their profile and the current conversation. Keep your responses helpful and encouraging.
**User's Profile:**
${JSON.stringify(profile,null,2)}
**Current Conversation:**
${historyString}
**New message sent by user:**
${message}
Answer accordingly`;
}

export function buildOnboardingPrompt(profile,message) {
    return `You are a friendly AI career advisor. This is your first conversation with a new user. Your primary goal is to conduct a brief, welcoming onboarding interview to understand them better.
1. Start by warmly welcoming them.
2. Ask them questions one by one to learn about their educational background, skills, and main interests.
3. Keep your tone encouraging.
4.This is user profile, only ask questions you feel is neccessary for you to guide them, dont make the questions too long.
**User's Profile:**
${JSON.stringify(profile,null,2)}
**User's first message to you**:
${message}
Answer accordingly`;
}

export const generateConversationAnalysis = async (previousMasterSummary, fullHistory) => {
    // Handle the case where history is empty to avoid errors.
    if (!fullHistory || fullHistory.length === 0) {
        return {
            title: "Empty Conversation",
            summary: "No conversation history to summarize.",
            updatedMasterSummary: previousMasterSummary || "No conversations yet."
        };
    }

    // Convert the history array into a clean, readable string transcript.
    const historyString = fullHistory.map(h => `${h.role}: ${h.content}`).join('\n\n');
    const existingSummary = previousMasterSummary || "This is the user's first conversation.";

    // Create a single, powerful prompt that asks for a JSON object.
    const prompt = `
    You are an expert career analyst. Your task is to analyze a user's existing summary and a new conversation transcript.

    **User's Existing Master Summary:**
    ${existingSummary}

    **New Conversation Transcript:**
    ${historyString}

        Based on ALL of this information, provide the following in a valid JSON object format:
    1. A short, engaging "title" for the new conversation (maximum 5 words).
    2. A concise, one-paragraph "summary" of the new conversation.
    3. An "updatedMasterSummary" that thoughtfully integrates the key insights from the new conversation into the user's existing master summary.
    4. An "aiCareerAnalysis" that thoughtfully analyses the user and gives them information on the potential career paths they could take and their 
    strengths and weaknesses, also include skills if they lack any or the ones that they should improve.
    Your response should be ONLY the JSON object and nothing else.

    **JSON Output Format:**
    {
    "title": "...",
    "summary": "...",
    "updatedMasterSummary": "...",
    "aiCareerAnalysis": "..."
    }
    `;

    try {
        const resp = await generativeModel.generateContent(prompt);
        let aiResponseText = resp.response.candidates[0].content.parts[0].text;
        aiResponseText = aiResponseText.replace(/```json|```/g, '').trim();
        
        // Parse the JSON string from the AI's response to get a usable object.
        const analysis = JSON.parse(aiResponseText);
        
        return analysis;

    } catch (error) {
        console.error("Error generating conversation analysis:", error);
        // Return a default object on failure so the app doesn't crash.
        return {
            title: "Analysis Failed",
            summary: "Could not generate a summary for this conversation.",
            updatedMasterSummary: existingSummary,
            aiCareerAnalysis: "Could not generate an AI Career Analysis for this conversation."
        };
    }
};