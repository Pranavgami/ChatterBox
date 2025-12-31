import { useNavigate } from "react-router-dom";
import assets from "../assets/assets.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useChat } from "../context/ChatContext.jsx";
import { useEffect, useState, useMemo } from "react";
import GroupChatModal from "./GroupChatModal.jsx";
import { BsPlusLg } from "react-icons/bs";
import axios from "axios";
import toast from "react-hot-toast";

const getConversationDisplayInfo = (conversation, currentUserId) => {
  if (conversation.isGroupChat) {
    return {
      name: conversation.groupName,
      pic: conversation.groupIcon || assets.group_avatar_icon,
      id: null,
    };
  } else {
    const otherUser = conversation.participants.find(
      (p) => p._id !== currentUserId
    );
    if (!otherUser) {
      return { name: "Unknown User", pic: assets.avatar_icon, id: null };
    }
    return {
      name: otherUser.fullname,
      pic: otherUser.profilePic || assets.avatar_icon,
      id: otherUser._id,
    };
  }
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const Sidebar = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const { authUser, logout, onlineUsers } = useAuth();
  const {
    conversations,
    getConversations,
    setSelectedConversation,
    selectedConversation,
    accessOrCreateChat,
    unreadCounts,
  } = useChat();

  const debouncedSearchTerm = useDebounce(input, 300);

  useEffect(() => {
    if (authUser) {
      getConversations();
    }
  }, [authUser, getConversations]);

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const searchUsers = async () => {
      setIsSearching(true);
      try {
        const { data } = await axios.get(
          `/api/auth/search?q=${debouncedSearchTerm}`
        );
        if (data.success) {
          setSearchResults(data.data);
        }
      } catch (error) {
        toast.error("Search failed");
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [debouncedSearchTerm]);

  const filteredConversations = useMemo(
    () =>
      conversations.filter((convo) => {
        const { name } = getConversationDisplayInfo(convo, authUser._id);
        return name.toLowerCase().includes(input.toLowerCase());
      }),
    [conversations, input, authUser._id]
  );

  const handleSelectUser = (user) => {
    accessOrCreateChat(user._id);
    setInput("");
    setSearchResults([]);
  };

  return (
    <>
      <div
        className="bg-[#8185B2]/10 h-full flex flex-col overflow-hidden text-white border-r border-stone-600/30"
      >
        <div className="p-4 md:p-5 border-b border-stone-600/30 bg-black/20">
          <div className="flex justify-between items-center">
            <img src={assets.logo} alt="logo" className="max-w-40" />
            <div className="relative py-2 group">
              <img
                src={assets.menu_icon}
                alt="icon"
                className="max-h-5 cursor-pointer"
              />
              <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 ease-in-out">
                <p
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer text-sm"
                >
                  Edit Profile
                </p>
                <hr className="my-2" />
                <p className="cursor-pointer text-sm" onClick={logout}>
                  Logout
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5">
            <div className="bg-[#282142] rounded-full flex items-center p-2 flex-1 border border-gray-600/30 focus-within:border-violet-500/50 transition-colors">
              <img
                src={assets.search_icon}
                alt="search"
                className="w-4 h-4 mx-2 opacity-60"
              />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                type="text"
                placeholder="Search users or groups"
                className="bg-transparent text-sm w-full outline-none placeholder-gray-400"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 bg-violet-600 hover:bg-violet-700 rounded-full transition-colors"
              title="Create Group Chat"
            >
              <BsPlusLg />
            </button>
          </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-4">
          <div className="flex flex-col mt-5">
            {input.length > 0 ? (
              <>
                <p className="text-gray-400 text-xs mb-2">SEARCH RESULTS</p>
                {isSearching && (
                  <p className="text-center text-gray-400">Loading...</p>
                )}
                {!isSearching && searchResults.length === 0 && (
                  <p className="text-center text-gray-400">No users found.</p>
                )}
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleSelectUser(user)}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[#282142]/50 transition-colors"
                  >
                    <img
                      src={user.profilePic || assets.avatar_icon}
                      alt="profile"
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.fullname}</p>
                      <p className="text-sm text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <p className="text-gray-400 text-xs mb-2">CONVERSATIONS</p>
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((convo) => {
                    const {
                      name,
                      pic,
                      id: otherUserId,
                    } = getConversationDisplayInfo(convo, authUser._id);

                    return (
                      <div
                        key={convo._id}
                        onClick={() => setSelectedConversation(convo)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[#282142]/50 transition-colors ${
                          selectedConversation?._id === convo._id
                            ? "bg-[#282142]/70"
                            : ""
                        }`}
                      >
                        <img
                          src={pic}
                          alt="profile"
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{name}</p>
                          {!convo.isGroupChat &&
                            (onlineUsers.includes(otherUserId) ? (
                              <span className="text-green-400 text-xs">
                                Online
                              </span>
                            ) : (
                              <span className="text-neutral-400 text-xs">
                                Offline
                              </span>
                            ))}
                        </div>
                        {unreadCounts[convo._id] > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                            {unreadCounts[convo._id]}
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-400 mt-10 px-4">
                    No conversations yet.
                    <br />
                    Search for a user or create a group to start chatting.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <GroupChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      </div>
    </>
  );
};

export default Sidebar;
