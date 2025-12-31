import { Server } from "socket.io";
import { v2 as cloudinary } from "cloudinary";
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";

let io;

const checkIfSeenByAll = async (conversationId) => {
  const conversation = await Conversation.findById(conversationId).populate(
    "participants"
  );
  const participantIds = conversation.participants.map((p) => p._id.toString());

  const messages = await Message.find({ conversationId });
  const updates = [];

  for (const msg of messages) {
    const readIds = msg.readBy.map((id) => id.toString());
    const allSeen = participantIds.every((id) => readIds.includes(id));
    if (allSeen && msg.status !== "seen") {
      msg.status = "seen";
      updates.push(msg.save());
    }
  }

  if (updates.length) await Promise.all(updates);
};

const chatEventHandlers = {
  setup: async (socket, userId) => {
    try {
      console.log(`Setting up user: ${userId}`);
      
      // Validate userId before using it in database queries
      if (!userId || userId === 'undefined' || userId.length !== 24) {
        console.error("Invalid userId in setup:", userId);
        socket.emit("setup-error", { message: "Invalid user ID" });
        return;
      }
      
      userSocketMap[userId] = socket.id;
      io.emit("online-users", Object.keys(userSocketMap));

      socket.join(userId);
      const userConversations = await Conversation.find({
        participants: userId,
      });
      userConversations.forEach((convo) => {
        socket.join(convo._id.toString());
      });
      socket.emit("setup-complete");
    } catch (error) {
      console.error("Error in setup event:", error);
      socket.emit("setup-error", { message: "Setup failed" });
    }
  },

  sendMessage: async (socket, messageData) => {
    try {
      const { senderId, conversationId, text, image } = messageData;

      if (!senderId || !conversationId) return;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const otherParticipants = conversation.participants.filter(
        (p) => p.toString() !== senderId
      );

      const isReceiverOnline = otherParticipants.some(
        (p) => userSocketMap[p.toString()]
      );

      const messageStatus = isReceiverOnline ? "delivered" : "sent";

      let uploadedImageUrl = null;
      if (image) {
        const uploadedResponse = await cloudinary.uploader.upload(image, {
          folder: "chat_messages",
        });
        uploadedImageUrl = uploadedResponse.secure_url;
      }

      const newMessage = new Message({
        senderId,
        conversationId,
        text: text || "",
        image: uploadedImageUrl,
        readBy: [senderId],
        status: messageStatus,
      });

      await newMessage.save();
      await Conversation.findByIdAndUpdate(conversationId, {
        latestMessage: newMessage._id,
      });

      for (const userId of conversation.participants) {
        if (userId.toString() === senderId) continue;
        const unreadCount = await Message.countDocuments({
          conversationId,
          readBy: { $ne: userId },
        });
        io.to(userId.toString()).emit("unreadCountUpdate", {
          conversationId,
          unreadCount,
        });
      }

      const populatedMessage = await Message.findById(newMessage._id).populate(
        "senderId",
        "fullname profilePic"
      );

      io.to(conversationId).emit("newMessage", populatedMessage);
    } catch (error) {
      console.error("Error in sendMessage event:", error);
      socket.emit("sendMessageError", { message: "Failed to send message." });
    }
  },

  markAsRead: async (socket, { conversationId, userId }) => {
    try {
      await Message.updateMany(
        { conversationId, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      );

      await checkIfSeenByAll(conversationId);

      io.to(conversationId).emit("messagesRead", { conversationId, userId });

      const unreadCount = await Message.countDocuments({
        conversationId,
        readBy: { $ne: userId },
      });
      io.to(userId.toString()).emit("unreadCountUpdate", {
        conversationId,
        unreadCount,
      });
    } catch (error) {
      console.error("Error in markAsRead event:", error);
    }
  },

  startTyping: (socket, { conversationId }) => {
    socket.to(conversationId).emit("typing", { conversationId });
  },

  stopTyping: (socket, { conversationId }) => {
    socket.to(conversationId).emit("stopTyping", { conversationId });
  },

  disconnect: (socket) => {
    console.log("User disconnected:", socket.id);
    for (const userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        io.emit("online-users", Object.keys(userSocketMap));
        break;
      }
    }
  },
};

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Middleware for authenticating socket connections
  io.use((socket, next) => {
    const userId = socket.handshake.query.userId;
    if (userId && userId !== 'undefined' && userId.length === 24) {
      socket.userId = userId;
      return next();
    }
    console.log("Socket authentication failed - Invalid user ID:", userId);
    return next(new Error("Authentication error: Valid User ID not provided."));
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id, "User ID:", socket.userId);

    chatEventHandlers.setup(socket, socket.userId);

    socket.on("sendMessage", (data) =>
      chatEventHandlers.sendMessage(socket, data)
    );
    socket.on("markAsRead", (data) =>
      chatEventHandlers.markAsRead(socket, data)
    );

    socket.on("messageDelivered", async ({ messageId }) => {
      try {
        const message = await Message.findByIdAndUpdate(
          messageId,
          { status: "delivered" },
          { new: true }
        );
        if (message) {
          io.to(message.senderId.toString()).emit(
            "messageStatusUpdated",
            message
          );
        }
      } catch (error) {
        console.error("Error in messageDelivered:", error);
      }
    });

    socket.on("startTyping", (data) =>
      chatEventHandlers.startTyping(socket, data)
    );
    socket.on("stopTyping", (data) =>
      chatEventHandlers.stopTyping(socket, data)
    );
    socket.on("disconnect", () => chatEventHandlers.disconnect(socket));
  });

  console.log("Socket.IO initialized.");
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized!");
  }
  return io;
};

// Export the map to track which user has which socket ID
export const userSocketMap = {};
