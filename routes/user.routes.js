import express, { Router } from 'express';
import { endConversation, getConversations, getProfile, postChatMessageWithHistory, postProfile, startConversation } from '../controllers/user.controllers.js';

const router = express.Router();

router.get("/profile",getProfile);
router.post("/profile",postProfile);
router.get("/start-conversation",startConversation);
router.post("/post-message",postChatMessageWithHistory);
router.post("/end-conversation",endConversation);
router.get("/conversations",getConversations);

export default router;

