import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = BACKEND_URL;

const ChatContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

const ChatProvider = ({ children }) => {
  const [message, setMessage] = useState([]);
  const [users, setUsers] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessage, setUnseenMessage] = useState([]);

  const { socket } = useAuth();

  const getUsers = async () => {
    try {
      const response = await axios.get("/api/messages/users");
      if (response.data.success) {
        setUsers(response.data.data.users);
        setUnseenMessage(response.data.data.unseenMessage || []);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const getMessages = async (userId) => {
    try {
      const response = await axios.get(`/api/messages/${userId}`);
      if (response.data.success) {
        setMessage(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const sendMessage = async (messageData) => {
    try {
      const response = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (response.data.success) {
        setMessage((prev) => [...prev, response.data.data]);
      } else {
        toast.error(response.data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    }
  };

  const subscribeToSocket = () => {
    if (!socket) return;
    socket.on("new-message", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessage((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${selectedUser._id}`);
      } else {
        setUnseenMessage((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  const unsubscribeFromSocket = () => {
    if (!socket) return;
    socket.off("newMessage");
  };

  useEffect(() => {
    subscribeToSocket();
    return () => unsubscribeFromSocket();
  }, [socket, selectedUser]);

  const value = {
    message,
    users,
    selectedUser,
    unseenMessage,
    setMessage,
    getUsers,
    setSelectedUser,
    getMessages,
    sendMessage,
    setUnseenMessage,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatProvider;
