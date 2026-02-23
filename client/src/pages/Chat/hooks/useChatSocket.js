import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../../hooks/useSocket";

export const useChatSocket = (room, user, sellerId, setMessages) => {
  const socket = useSocket();
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit("join_room", { room, userId: user._id });
    socket.emit("check_online_status", sellerId);

    const handleReceiveMessage = (message) =>
      setMessages((prev) => [...prev, message]);
    const handleTypingStatus = (data) => {
      if (data.userId !== user._id && data.room === room) {
        setIsOtherTyping(data.isTyping);
      }
    };
    const handleUserStatusChange = (data) => {
      if (data.userId === sellerId) {
        setIsOnline(data.status === "online");
      }
    };
    const handleOnlineStatusResult = (data) => {
      if (data.userId === sellerId) {
        setIsOnline(data.isOnline);
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing_status", handleTypingStatus);
    socket.on("user_status_change", handleUserStatusChange);
    socket.on("online_status_result", handleOnlineStatusResult);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing_status", handleTypingStatus);
      socket.off("user_status_change", handleUserStatusChange);
      socket.off("online_status_result", handleOnlineStatusResult);
    };
  }, [socket, room, user, sellerId, setMessages]);

  const handleTyping = () => {
    if (!socket || !user || !room) return;
    socket.emit("typing", { room, userId: user._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { room, userId: user._id });
    }, 3000);
  };

  const handleSendMessageEvent = (messageData) => {
    socket?.emit("send_message", messageData);
    socket?.emit("stop_typing", { room, userId: user._id });
  };

  return { isOtherTyping, isOnline, handleTyping, handleSendMessageEvent };
};
