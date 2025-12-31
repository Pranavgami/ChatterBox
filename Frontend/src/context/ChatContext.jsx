import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
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
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});

  const { authUser, socket } = useAuth();

  const getConversations = useCallback(async () => {
    try {
      if (!authUser) return;
      const response = await axios.get("/api/conversations");
      setConversations(response.data.data);
    } catch (error) {
      toast.error(error.message);
    }
  }, [authUser]);

  const getMessages = useCallback(
    async (conversation) => {
      if (!conversation || !authUser) return;
      setLoadingMessages(true);
      try {
        const response = await axios.get(
          `/api/conversations/${conversation._id}/messages`
        );  
        setMessages(response.data.data);
        
        // Only emit if socket is available
        if (socket && socket.connected) {
          socket.emit("markAsRead", {
            conversationId: conversation._id,
            userId: authUser._id,
          });
        } else {
          console.warn("Socket not available for markAsRead:", { socket: !!socket, connected: socket?.connected });
        }
      } catch (error) {
        toast.error("Failed to load messages");
        console.error(error);
      } finally {
        setLoadingMessages(false);
      }
    },
    [socket, authUser]
  );

  const sendMessage = (messageData) => {
    if (!socket || !selectedConversation) {
      console.warn("Cannot send message:", { socket: !!socket, selectedConversation: !!selectedConversation });
      return;
    }
    socket.emit("sendMessage", {
      ...messageData,
      senderId: authUser._id,
      conversationId: selectedConversation._id,
    });
  };

  const startTyping = () => {
    if (!socket || !selectedConversation) {
      console.warn("Cannot start typing:", { socket: !!socket, selectedConversation: !!selectedConversation });
      return;
    }
    socket.emit("startTyping", { conversationId: selectedConversation._id });
  };

  const stopTyping = () => {
    if (!socket || !selectedConversation) {
      console.warn("Cannot stop typing:", { socket: !!socket, selectedConversation: !!selectedConversation });
      return;
    }
    socket.emit("stopTyping", { conversationId: selectedConversation._id });
  };

  const createGroupChat = async (groupName, participants, groupIcon = null) => {
    if (!groupName || !participants || participants.length < 2) {
      toast.error("Group name and at least 2 members are required");
      return false;
    }
    try {
      const response = await axios.post("/api/conversations/group", {
        groupName,
        participants: participants.map((p) => p._id),
        groupIcon,
      });

      if (response.data.success) {
        const newGroup = response.data.data;
        setConversations((prev) => [newGroup, ...prev]);
        setSelectedConversation(newGroup);

        if (socket && socket.connected) {
          socket.emit("setup", authUser._id);
        } else {
          console.warn("Socket not available for group setup:", { socket: !!socket, connected: socket?.connected });
        }

        toast.success("Group created successfully!");
        return true; // Return true on success
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
      return false; // Return false on failure
    }
  };

  const accessOrCreateChat = async (otherUserId) => {
    if (!otherUserId) return;

    try {
      // This calls your backend API
      const response = await axios.post("/api/conversations", {
        otherUserId,
      });

      if (response.data.success) {
        const newChat = response.data.data;

        // Check if chat already exists in our list
        if (!conversations.find((c) => c._id === newChat._id)) {
          setConversations([newChat, ...conversations]);
        }
        setSelectedConversation(newChat);
        if (socket && socket.connected) {
          socket.emit("setup", authUser._id);
        } else {
          console.warn("Socket not available for chat setup:", { socket: !!socket, connected: socket?.connected });
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start chat");
    }
  };

  const updateGroupIcon = async (conversationId, groupIcon) => {
    try {
      const response = await axios.put(`/api/conversations/${conversationId}/icon`, {
        groupIcon,
      });

      if (response.data.success) {
        const updatedGroup = response.data.data;
        
        // Update conversations list
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === conversationId ? updatedGroup : conv
          )
        );

        // Update selected conversation if it's the same group
        if (selectedConversation?._id === conversationId) {
          setSelectedConversation(updatedGroup);
        }

        toast.success("Group icon updated successfully!");
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update group icon");
      return false;
    }
  };

  useEffect(() => {
    if (!socket || !authUser) return;

    // Listener for new incoming messages
    const handleNewMessage = (newMessage) => {
      // If the message is for the currently selected conversation, add it to the view
      if (selectedConversation?._id === newMessage.conversationId) {
        setMessages((prev) => [...prev, newMessage]);
        // And immediately mark it as read
        if (socket && socket.connected) {
          socket.emit("markAsRead", {
            conversationId: newMessage.conversationId,
            userId: authUser._id,
          });
        } else {
          console.warn("Socket not available for markAsRead in message handler:", { socket: !!socket, connected: socket?.connected });
        }
      }
    };

    const handleUnreadCountUpdate = ({ conversationId, unreadCount }) => {
      setUnreadCounts((prev) => ({
        ...prev,
        [conversationId]: unreadCount,
      }));
    };

    // Listener for when someone has read messages in a conversation
    const handleMessagesRead = ({ conversationId, userId }) => {
      if (selectedConversation?._id === conversationId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            if (msg.senderId._id !== userId) {
              return {
                ...msg,
                status: "seen",
                readBy: [...new Set([...msg.readBy, userId])],
              };
            }
            return msg;
          })
        );
      }
    };

    const handleTyping = ({ conversationId }) => {
      if (selectedConversation?._id === conversationId) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ conversationId }) => {
      if (selectedConversation?._id === conversationId) {
        setIsTyping(false);
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("unreadCountUpdate", handleUnreadCountUpdate);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    // Cleanup function to remove listeners
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("unreadCountUpdate", handleUnreadCountUpdate);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, selectedConversation, authUser]);

  const value = {
    conversations,
    getConversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    setMessages,
    getMessages,
    loadingMessages,
    sendMessage,
    isTyping,
    startTyping,
    stopTyping,
    createGroupChat,
    unreadCounts,
    setUnreadCounts,
    accessOrCreateChat,
    updateGroupIcon,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatProvider;
