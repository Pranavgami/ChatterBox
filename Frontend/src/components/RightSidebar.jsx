import { useEffect, useState } from "react";
import assets from "../assets/assets";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

const RightSidebar = () => {
  const { selectedUser, message } = useChat();
  const { logout, onlineUsers } = useAuth();
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    setMsgImages(message?.filter((msg) => msg.image).map((msg) => msg.image));
  }, [message]);

  return (
    selectedUser && (
      <div
        className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${selectedUser}?'max-md:hidden':''`}
      >
        <div className="pt-10 md:pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
          <img
            className="w-20 aspect-[1/1] rounded-full"
            src={selectedUser.profilePic || assets.avatar_icon}
            alt="user_avatar"
          />
          <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
            {onlineUsers.includes(selectedUser._id) && (
              <p className="w-2 h-2 rounded-full bg-green-500"></p>
            )}
            {selectedUser.fullname}
          </h1>
          <p className="px-10 mask-auto">{selectedUser.bio}</p>
        </div>
        <hr className="my-4 bg-[#ffffff50]" />
        <div className="px-5 text-xs">
          <p>Media</p>
          <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
            {msgImages?.map((url, index) => (
              <div className="" key={index}>
                <div
                  key={index}
                  className="cursor-pointer rounded"
                  onClick={() => window.open(url)}
                >
                  <img src={url} alt="" className="h-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-[80%] mx-auto absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-base font-light py-2 rounded-full cursor-pointer"
        >
          Logout
        </button>
      </div>
    )
  );
};

export default RightSidebar;
