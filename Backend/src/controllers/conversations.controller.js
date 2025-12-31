import { sendResponse } from "../helpers/responseHandler.js";
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import ApiError from "../errors/ApiError.js";

// Creates or finds a 1-on-1 chat
const accessConversation = async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const currentUserId = req.user.id;

    if (!otherUserId) {
      throw new ApiError(400, "Other user ID is required!");
    }

    let conversation = await Conversation.findOne({
      isGroupChat: false,
      participants: { $all: [currentUserId, otherUserId] },
    }).populate("participants", "-password");

    if (conversation) {
      return sendResponse(
        res,
        200,
        "Conversation fetched successfully",
        conversation
      );
    }

    const newConversation = new Conversation({
      participants: [currentUserId, otherUserId],
    });

    const savedConversation = await newConversation.save();
    const populatedConversation = await Conversation.findById(
      savedConversation._id
    ).populate("participants", "-password");

    return sendResponse(
      res,
      201,
      "Conversation created successfully",
      populatedConversation
    );
  } catch (error) {
    throw new ApiError(
      error.status || 500,
      error.message || "Internal server error"
    );
  }
};

// Creates a new group chat
const createGroupChat = async (req, res) => {
  const { groupName, participants, groupIcon } = req.body;
  const currentUserId = req.user.id;

  if (!groupName || !participants || participants.length < 2) {
    throw new ApiError(
      400,
      "Group name and at least 2 participants are required."
    );
  }

  const allParticipants = [...participants, currentUserId];

  const groupConversation = new Conversation({
    groupName,
    participants: allParticipants,
    isGroupChat: true,
    groupAdmin: currentUserId,
    groupIcon: groupIcon || null, // Optional group icon
  });

  const savedGroup = await groupConversation.save();
  const populatedGroup = await Conversation.findById(savedGroup._id)
    .populate("participants", "-password")
    .populate("groupAdmin", "-password");

  return sendResponse(res, 201, "Group created successfully", populatedGroup);
};

// Gets all conversations for the logged-in user
const getMyConversations = async (req, res) => {
  const currentUserId = req.user.id;

  const conversations = await Conversation.find({ participants: currentUserId })
    .populate("participants", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

  await Message.populate(conversations, {
    path: "latestMessage.senderId",
    select: "fullname email profilePic",
  });

  return sendResponse(
    res,
    200,
    "Conversations fetched successfully",
    conversations
  );
};

// Gets all messages for a specific conversation
const getMessagesByConversation = async (req, res) => {
  const { conversationId } = req.params;

  if (!conversationId) {
    throw new ApiError(400, "Conversation ID is required");
  }

  const messages = await Message.find({ conversationId })
    .populate("senderId", "fullname email profilePic")
    .populate("readBy", "fullname");

  return sendResponse(res, 200, "Msssages fetched successfully", messages);
};

// Updates group icon (only group members can update)
const updateGroupIcon = async (req, res) => {
  const { conversationId } = req.params;
  const { groupIcon } = req.body;
  const currentUserId = req.user.id;

  if (!conversationId) {
    throw new ApiError(400, "Conversation ID is required");
  }

  // Find the conversation and check if user is a participant
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    throw new ApiError(404, "Group not found");
  }

  if (!conversation.isGroupChat) {
    throw new ApiError(400, "This is not a group chat");
  }

  // Check if current user is a participant
  const isParticipant = conversation.participants.some(
    (participant) => participant.toString() === currentUserId
  );

  if (!isParticipant) {
    throw new ApiError(403, "You are not a member of this group");
  }

  // Update the group icon
  const updatedGroup = await Conversation.findByIdAndUpdate(
    conversationId,
    { groupIcon },
    { new: true }
  )
    .populate("participants", "-password")
    .populate("groupAdmin", "-password");

  return sendResponse(res, 200, "Group icon updated successfully", updatedGroup);
};

export default {
  accessConversation,
  createGroupChat,
  getMyConversations,
  getMessagesByConversation,
  updateGroupIcon,
};
