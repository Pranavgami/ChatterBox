import { useState } from "react";
import { useChat } from "../context/ChatContext";
import axios from "axios";
import toast from "react-hot-toast";
import assets from "../assets/assets";

const GroupChatModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupIcon, setGroupIcon] = useState(null);
  const [groupIconPreview, setGroupIconPreview] = useState(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const { createGroupChat } = useChat();

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setGroupIcon(reader.result);
        setGroupIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeIcon = () => {
    setGroupIcon(null);
    setGroupIconPreview(null);
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(`/api/auth/search?q=${query}`);
      setSearchResults(data.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load search results");
      setLoading(false);
    }
  };

  const handleAddUser = (userToAdd) => {
    if (selectedUsers.some((u) => u._id === userToAdd._id)) {
      toast.error("User already added");
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleRemoveUser = (userToRemove) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userToRemove._id));
  };

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }
    
    if (selectedUsers.length < 2) {
      toast.error("At least 2 members are required");
      return;
    }

    setUploadingIcon(true);
    const success = await createGroupChat(groupName, selectedUsers, groupIcon);
    if (success) {
      setGroupName("");
      setSearch("");
      setSelectedUsers([]);
      setSearchResults([]);
      setGroupIcon(null);
      setGroupIconPreview(null);
      onClose();
    }
    setUploadingIcon(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto p-6 bg-[#282142] text-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-white z-10"
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold text-center mb-6">
          Create Group Chat
        </h2>

        <div className="flex flex-col gap-4">
          {/* Group Icon Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-[#8185B2]/20 flex items-center justify-center">
                {groupIconPreview ? (
                  <img
                    src={groupIconPreview}
                    alt="Group Icon"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={assets.group_avatar_icon}
                    alt="Default Group Icon"
                    className="w-12 h-12 opacity-50"
                  />
                )}
              </div>
              {groupIconPreview && (
                <button
                  onClick={removeIcon}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              )}
            </div>
            <label className="cursor-pointer bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg text-sm transition-colors">
              {groupIconPreview ? "Change Icon" : "Add Group Icon"}
              <input
                type="file"
                accept="image/*"
                onChange={handleIconChange}
                className="hidden"
              />
            </label>
          </div>

          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="bg-[#8185B2]/20 p-3 rounded outline-none placeholder-gray-400"
          />
          <input
            type="text"
            placeholder="Search users to add..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="bg-[#8185B2]/20 p-3 rounded outline-none placeholder-gray-400"
          />
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-300 mb-2">Selected Members ({selectedUsers.length})</p>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center gap-2 bg-violet-600 px-3 py-1 rounded-full text-sm"
                >
                  <img
                    src={u.profilePic || assets.avatar_icon}
                    alt={u.fullname}
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="max-w-20 truncate">{u.fullname}</span>
                  <button 
                    onClick={() => handleRemoveUser(u)} 
                    className="ml-1 hover:text-red-300"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="mt-4">
          {search && (
            <p className="text-sm text-gray-300 mb-2">Search Results</p>
          )}
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
            {loading ? (
              <p className="text-center py-4 text-gray-400">Loading...</p>
            ) : (
              searchResults.slice(0, 4).map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleAddUser(user)}
                  className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-[#8185B2]/30 transition-colors"
                >
                  <img
                    src={user.profilePic || assets.avatar_icon}
                    alt={user.fullname}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.fullname}</p>
                    <p className="text-sm text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={uploadingIcon || !groupName.trim() || selectedUsers.length < 2}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-3 mt-6 rounded-lg transition-colors"
        >
          {uploadingIcon ? "Creating Group..." : "Create Group"}
        </button>
      </div>
    </div>
  );
};

export default GroupChatModal;
