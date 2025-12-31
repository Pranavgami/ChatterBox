import { useState } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import assets from "../assets/assets";

const GroupIconModal = ({ isOpen, onClose, conversation }) => {
  const [groupIcon, setGroupIcon] = useState(null);
  const [groupIconPreview, setGroupIconPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { updateGroupIcon } = useChat();
  const { authUser } = useAuth();

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

  const handleSubmit = async () => {
    if (!groupIcon) {
      toast.error("Please select an icon");
      return;
    }

    setUploading(true);
    const success = await updateGroupIcon(conversation._id, groupIcon);
    if (success) {
      setGroupIcon(null);
      setGroupIconPreview(null);
      onClose();
    }
    setUploading(false);
  };

  const handleRemoveIcon = async () => {
    setUploading(true);
    const success = await updateGroupIcon(conversation._id, null);
    if (success) {
      setGroupIcon(null);
      setGroupIconPreview(null);
      onClose();
    }
    setUploading(false);
  };

  if (!isOpen || !conversation) return null;

  // Check if user is a participant
  const isParticipant = conversation.participants.some(
    (participant) => participant._id === authUser._id
  );

  if (!isParticipant) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm p-6 bg-[#282142] text-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-white"
        >
          &times;
        </button>
        
        <h2 className="text-xl font-semibold text-center mb-6">
          Update Group Icon
        </h2>

        <div className="flex flex-col items-center gap-4">
          {/* Current Group Icon */}
          <div className="text-center">
            <p className="text-sm text-gray-300 mb-2">Current Icon</p>
            <div className="w-20 h-20 rounded-full overflow-hidden bg-[#8185B2]/20 flex items-center justify-center mx-auto">
              <img
                src={conversation.groupIcon || assets.group_avatar_icon}
                alt="Current Group Icon"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* New Icon Preview */}
          {groupIconPreview && (
            <div className="text-center">
              <p className="text-sm text-gray-300 mb-2">New Icon</p>
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#8185B2]/20 flex items-center justify-center mx-auto">
                  <img
                    src={groupIconPreview}
                    alt="New Group Icon"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={removeIcon}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <label className="cursor-pointer bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg text-sm transition-colors">
            {groupIconPreview ? "Change Icon" : "Select New Icon"}
            <input
              type="file"
              accept="image/*"
              onChange={handleIconChange}
              className="hidden"
            />
          </label>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full mt-4">
            {conversation.groupIcon && (
              <button
                onClick={handleRemoveIcon}
                disabled={uploading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-2 rounded-lg text-sm transition-colors"
              >
                {uploading ? "Removing..." : "Remove Icon"}
              </button>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={uploading || !groupIcon}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-2 rounded-lg text-sm transition-colors"
            >
              {uploading ? "Updating..." : "Update Icon"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupIconModal;