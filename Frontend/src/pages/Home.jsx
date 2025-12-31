import Sidebar from "../components/Sidebar";
import RightSidebar from "../components/RightSidebar";
import ChatContainer from "../components/ChatContainer";
import { useChat } from "../context/ChatContext";

const Home = () => {
  const { selectedConversation } = useChat();

  return (
    <div className="w-full h-screen overflow-hidden">
      <div className="grid h-full w-full bg-black/20 backdrop-blur-xl grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[320px_1fr_280px] xl:grid-cols-[350px_1fr_300px]">
        {/* Sidebar - Hidden on mobile when chat is selected */}
        <div className={`${selectedConversation ? 'hidden md:block' : 'block'} h-full`}>
          <Sidebar />
        </div>
        
        {/* Chat Container - Full width on mobile, center column on desktop */}
        <div className={`${selectedConversation ? 'block' : 'hidden md:block'} h-full flex flex-col min-h-0`}>
          <ChatContainer />
        </div>
        
        {/* Right Sidebar - Hidden on mobile and tablet, visible on large screens */}
        <div className={`${selectedConversation ? 'hidden lg:block' : 'hidden'} h-full`}>
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default Home;
