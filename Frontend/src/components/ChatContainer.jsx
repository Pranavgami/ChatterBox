import { useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessagetime } from "../lib/utils";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import MessageStatus from "./MessageStatus";
import GroupIconModal from "./GroupIconModal";

const getConversationName = (conversation, currentUserId) => {
  if (conversation.isGroupChat) {
    return conversation.groupName;
  }
  return conversation.participants.find((p) => p._id !== currentUserId)
    ?.fullname;
};

const getConversationDisplayInfo = (conversation, currentUserId) => {
  if (conversation.isGroupChat) {
    return { pic: conversation.groupIcon || assets.group_avatar_icon };
  } else {
    const otherUser = conversation.participants.find(
      (p) => p._id !== currentUserId
    );
    return { pic: otherUser.profilePic || assets.avatar_icon };
  }
};

const ChatContainer = () => {
  const {
    messages,
    selectedConversation,
    setSelectedConversation,
    sendMessage,
    getMessages,
    isTyping,
    startTyping,
    stopTyping,
  } = useChat();
  const { authUser } = useAuth();
  const scrollEnd = useRef();
  const [input, setInput] = useState("");
  const [showGroupIconModal, setShowGroupIconModal] = useState(false);

  const handleInput = (e) => {
    setInput(e.target.value);
    startTyping();
    setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const handleSendMessage = () => {
    if (input.trim() === "") return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleSendImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      sendMessage({ image: reader.result });
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  useEffect(() => {
    if (selectedConversation) {
      getMessages(selectedConversation);
    }
  }, [selectedConversation, getMessages]);

  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white max-md:hidden">
        <img src={assets.logo_icon} alt="logo" className="max-w-16" />
        <p className="text-lg mt-2">Select a chat to start messaging</p>
      </div>
    );
  }

  const { pic: headerPic } = getConversationDisplayInfo(
    selectedConversation,
    authUser._id
  );

  return (
    <div className="h-full flex flex-col relative backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-500 bg-black/20 backdrop-blur-sm">
        <div className="relative">
          <img 
            src={headerPic} 
            alt="profile" 
            className="w-10 h-10 md:w-12 md:h-12 rounded-full cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => {
              if (selectedConversation.isGroupChat) {
                setShowGroupIconModal(true);
              }
            }}
          />
          {selectedConversation.isGroupChat && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-violet-600 rounded-full flex items-center justify-center">
              <span className="text-xs">📷</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base md:text-lg text-white font-medium truncate">
            {getConversationName(selectedConversation, authUser._id)}
          </p>
          {selectedConversation.isGroupChat && (
            <p className="text-xs text-gray-400">
              {selectedConversation.participants.length} members
            </p>
          )}
          {isTyping && <p className="text-xs text-green-400">typing...</p>}
        </div>
        <button
          onClick={() => setSelectedConversation(null)}
          className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <img
            src={assets.arrow_icon}
            alt="back"
            className="w-5 h-5"
          />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 py-2">
        <div className="min-h-full flex flex-col justify-end">
          {messages?.map((msg) => {
            const amISender = msg.senderId._id === authUser._id;
            const senderProfile = amISender ? authUser : msg.senderId;

            return (
              <div
                key={msg._id}
                className={`flex items-end gap-2 mb-3 ${
                  amISender ? "justify-end" : "justify-start"
                }`}
              >
                {!amISender && (
                  <img
                    src={senderProfile.profilePic || assets.avatar_icon}
                    alt="avatar"
                    className="w-6 h-6 md:w-7 md:h-7 rounded-full flex-shrink-0"
                  />
                )}
                <div
                  className={`flex flex-col max-w-[75%] md:max-w-[70%] ${
                    amISender ? "items-end" : "items-start"
                  }`}
                >
                  {selectedConversation.isGroupChat && !amISender && (
                    <p className="text-xs text-gray-400 ml-2 mb-1">
                      {senderProfile.fullname}
                    </p>
                  )}

                  {msg.image ? (
                    <img
                      src={msg.image}
                      alt="chat content"
                      className="max-w-[180px] md:max-w-[250px] border-2 border-gray-700 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(msg.image, "_blank")}
                    />
                  ) : (
                    <div
                      className={`px-3 py-2 rounded-2xl break-words text-white text-sm md:text-base ${
                        amISender 
                          ? "bg-violet-600 rounded-br-md" 
                          : "bg-gray-700 rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 px-1">
                    <span>{formatMessagetime(msg.createdAt)}</span>
                    {amISender && (
                      <MessageStatus
                        message={msg}
                        conversation={selectedConversation}
                      />
                    )}
                  </div>
                </div>
                {amISender && (
                  <img
                    src={authUser.profilePic || assets.avatar_icon}
                    alt="avatar"
                    className="w-6 h-6 md:w-7 md:h-7 rounded-full flex-shrink-0"
                  />
                )}
              </div>
            );
          })}
          <div ref={scrollEnd}></div>
        </div>
      </div>

      {/* Input Container */}
      <div className="border-t border-stone-500 bg-black/20 backdrop-blur-sm p-3 md:p-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex-1 flex items-center bg-gray-800/50 border border-gray-600/30 rounded-full px-3 md:px-4 py-2 md:py-3 focus-within:border-violet-500/50 transition-colors">
            <input
              value={input}
              onChange={handleInput}
              onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage() : null)}
              type="text"
              placeholder="Send a message"
              className="flex-1 text-sm md:text-base bg-transparent border-none outline-none text-white placeholder-gray-400"
            />
            <input
              type="file"
              onChange={handleSendImage}
              id="image-upload"
              accept="image/*"
              hidden
            />
            <label htmlFor="image-upload" className="cursor-pointer p-1 hover:bg-white/10 rounded-full transition-colors">
              <img
                src={assets.gallery_icon}
                alt="gallery"
                className="w-5 h-5 md:w-6 md:h-6"
              />
            </label>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="p-2 md:p-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full transition-colors"
          >
            <img
              src={assets.send_button}
              className="w-5 h-5 md:w-6 md:h-6"
              alt="send"
            />
          </button>
        </div>
      </div>

      {/* Group Icon Modal */}
      <GroupIconModal
        isOpen={showGroupIconModal}
        onClose={() => setShowGroupIconModal(false)}
        conversation={selectedConversation}
      />
    </div>
  );
};

export default ChatContainer;
