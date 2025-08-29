import dotenv from 'dotenv';
import { VertexAI } from '@google-cloud/vertexai';

dotenv.config();

const PROJECT_ID = process.env.PROJECT_ID;
const LOCATION = process.env.LOCATION;
const MODEL_NAME = process.env.MODEL_NAME;
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const vertex_ai = new VertexAI({ project: PROJECT_ID, location: LOCATION });
const generativeModel = vertex_ai.getGenerativeModel({
  model: MODEL_NAME,
});

export default generativeModel;