import { useEffect, useState } from "react";
import assets from "../assets/assets";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

const RightSidebar = () => {
  const { selectedConversation, messages } = useChat();
  const { authUser } = useAuth();
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    if (messages) {
      setMsgImages(messages.filter((msg) => msg.image).map((msg) => msg.image));
    }
  }, [messages]);

  if (!selectedConversation) {
    return null;
  }

  const isGroup = selectedConversation.isGroupChat;
  const otherUser = !isGroup
    ? selectedConversation.participants.find((p) => p._id !== authUser._id)
    : null;

  if (!isGroup && !otherUser) {
    return null;
  }

  const displayName = isGroup
    ? selectedConversation.groupName
    : otherUser.fullname;
  const displayPic = isGroup
    ? assets.group_avatar_icon
    : otherUser.profilePic || assets.avatar_icon;
  const displayBio = isGroup
    ? `${selectedConversation.participants.length} Members`
    : otherUser.bio;

  return (
    <div className="bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll max-md:hidden">
      <div className="pt-10 md:pt-16 flex flex-col items-center gap-2 text-center">
        <img
          className="w-20 aspect-square rounded-full object-cover"
          src={displayPic}
          alt="avatar"
        />
        <h1 className="px-10 text-xl font-medium">{displayName}</h1>
        <p className="px-10 text-xs text-gray-300">{displayBio}</p>
      </div>
      <hr className="my-4 border-t border-gray-600" />

      {isGroup && (
        <div className="px-5">
          <p className="text-sm font-semibold mb-2">Members</p>
          <div className="flex flex-col gap-3 max-h-40 overflow-y-auto">
            {selectedConversation.participants.map((p) => (
              <div key={p._id} className="flex items-center gap-2 text-xs">
                <img
                  src={p.profilePic || assets.avatar_icon}
                  className="w-6 h-6 rounded-full"
                  alt={p.fullname}
                />
                <span>
                  {p.fullname}
                  {p._id === selectedConversation.groupAdmin ? " (Admin)" : ""}
                </span>
              </div>
            ))}
          </div>
          <hr className="my-4 border-t border-gray-600" />
        </div>
      )}

      <div className="px-5 text-xs">
        <p>Media ({msgImages.length})</p>
        <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-3 gap-2">
          {msgImages.map((url, index) => (
            <div
              key={index}
              className="cursor-pointer rounded overflow-hidden aspect-square"
              onClick={() => window.open(url, "_blank")}
            >
              <img
                src={url}
                alt="shared media"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
