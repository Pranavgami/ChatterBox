import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isGroupChat: { type: Boolean, default: false },
    groupName: { type: String, trim: true }, // Only for group chats
    groupIcon: { type: String }, // URL for group icon image
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Only for group chats
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
