import mongoose from 'mongoose';

// The messageSchema defines the structure of each message in the history.
const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'model'], // Can only be 'user' or 'model' (the AI)
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt:{
    type:Date,
    default: Date.now,
  }
}, { _id: false }); // We don't need a separate _id for each message

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Stores the User's _id
      ref: 'User',                         // 🔗 This creates the link to the User model
      required: true,
      index: true,                         // Speeds up finding conversations by user
    },
    history: [messageSchema],
    summary: {
      type: String, // e.g., "Discussed transition from marketing to data science."
    },
    title: { type: String, default: "New Conversation" },
    topic: { type: String, trim: true },
  },
  { timestamps: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;