import { sendResponse } from "../helpers/responseHandler.js";
import User from "../models/users.js";
import Message from "../models/message.js";
import { io, userSocketMap } from "../app.js";

const getUserById = async (req, res) => {
  try {
    const userId = req.User.id;
    const filteredUsers = await User.find({ _id: { $ne: { userId } } }).select(
      "-password"
    );
    const unseenMessage = {};
    const promices = filteredUsers.map(async (user) => {
      const message = await Message.find({
        seen: false,
        $or: [
          { senderId: userId, to: user._id },
          { recieverId: user._id, to: userId },
        ],
      });
      if (message.length > 0) {
        unseenMessage[user._id] = await message.length;
      }
    });
    await Promise.all(promices);
    return sendResponse(200, "Data retrived successfully", {
      users: filteredUsers,
      unseenMessage,
    });
  } catch (err) {
    throw new ApiError(err.status || 500, err.message || "Server Error");
  }
};

const getMessages = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [
        { senderId: userId, recieverId: id },
        { senderId: id, recieverId: userId },
      ],
    });

    await Message.updateMany(
      { senderId: id, recieverId: userId, seen: false },
      { $set: { seen: true } }
    );

    return sendResponse(res, 200, "Data retrived successfully", { messages });
  } catch (err) {
    throw new ApiError(err.status || 500, err.message || "Server Error");
  }
};

const marksAsSeen = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    await Message.updateMany(
      { senderId: id, recieverId: userId, seen: false },
      { $set: { seen: true } }
    );
    return sendResponse(res, 200, "Messages marked as seen");
  } catch (err) {
    throw new ApiError(err.status || 500, err.message || "Server Error");
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const senderId = req.user.id;
    const { id: recieverId } = req.params;
    let imageUrl = null;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = await Message.create({
      senderId,
      recieverId,
      text,
      image: imageUrl,
    });

    // Emit the message to the receiver if they are online
    const receiverSocketId = userSocketMap[recieverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("new-message", newMessage);
    }

    return sendResponse(res, 200, "Message sent successfully", { newMessage });
  } catch (err) {
    throw new ApiError(err.status || 500, err.message || "Server Error");
  }
};

export default { getUserById, getMessages, marksAsSeen, sendMessage };
