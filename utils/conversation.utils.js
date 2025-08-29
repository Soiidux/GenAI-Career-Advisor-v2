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