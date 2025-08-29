import express from 'express';
import dotenv from 'dotenv';
import { VertexAI } from '@google-cloud/vertexai';
import { dbConnect } from './db/dbConnect.js';
import router from './routes/user.routes.js';

//loading configs
dotenv.config();
const PROJECT_ID = process.env.PROJECT_ID;
const LOCATION = process.env.LOCATION;
const MODEL_NAME = process.env.MODEL_NAME;
// const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const PORT = process.env.PORT;

//initializing the app
const app = express();
app.use(express.json());     //json built-in middleware
app.use(router);

//initializing vertexAI
const vertex_ai = new VertexAI({ project: PROJECT_ID, location: LOCATION });
const generativeModel = vertex_ai.getGenerativeModel({
  model: MODEL_NAME,
});

app.post('/get-advice', async (req, res) => {
  try {
    const { profile_text } = req.body; // Get user profile from the request

    if (!profile_text) {
      return res.status(400).send({ error: 'profile_text is required' });
    }

    // This is where your powerful, detailed prompt will go!
    const prompt = `
      You are an expert career advisor for students in India. 
      Analyze the following user profile and generate 3 suitable career paths.
      For each path, list the required skills and identify any skill gaps.

      User Profile:
      ${profile_text}
    `;

    // Send the prompt to the Gemini model
    const resp = await generativeModel.generateContent(prompt);
    const aiResponse = resp.response.candidates[0].content.parts[0].text;

    // Send the AI's response back to the frontend
    res.json({ advice: aiResponse });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ error: 'Something went wrong with the AI service.' });
  }
});


dbConnect()
  .then(()=>{
    app.listen(PORT,()=>{
    console.log("Server listening at port: ",PORT);
    })
  })
  .catch((error)=>{
    console.log(`Mongodb connection error: ${error}`)
})