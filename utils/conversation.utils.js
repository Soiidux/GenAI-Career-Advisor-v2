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


export function buildChatPrompt(profile, history) {
    const historyString = history.map(h => `${h.role}: ${h.content}`).join('\n');
    return `You are an expert career advisor for students in India. Your goal is to help the user based on their profile and the current conversation. Keep your responses helpful and encouraging.
**User's Profile:**
${JSON.stringify(profile,null,2)}
**Current Conversation:**
${historyString}
`;
}

export function buildOnboardingPrompt(profile) {
    return `You are a friendly AI career advisor. This is your first conversation with a new user. Your primary goal is to conduct a brief, welcoming onboarding interview to understand them better.
1. Start by warmly welcoming them.
2. Ask them questions one by one to learn about their educational background, skills, and main interests.
3. Keep your tone encouraging.
4.This is user profile, only ask questions you feel is neccessary for you to guide them, dont make the questions too long.
**User's Profile:**
${JSON.stringify(profile,null,2)}
`;
}