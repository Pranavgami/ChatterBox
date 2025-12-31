import { BsCheck, BsCheck2All } from "react-icons/bs";

const MessageStatus = ({ message, conversation }) => {
  if (!message) {
    return null;
  }

  if (message.status === "seen") {
    return <BsCheck2All className="inline-block ml-1 text-blue-500" />;
  }

  if (message.status === "delivered") {
    return <BsCheck2All className="inline-block ml-1" />;
  }

  if (message.status === "sent") {
    return <BsCheck className="inline-block ml-1" />;
  }

  return null;
};

export default MessageStatus;
