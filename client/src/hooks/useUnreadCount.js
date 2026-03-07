import { useState, useEffect } from "react";
import { useSocket } from "./useSocket";

/**
 * Custom hook that polls the server for the current user's unread message count.
 * Returns the unread count as a number (0 when not logged in or on error).
 *
 * @param {object|null} user - The currently authenticated user (null when logged out).
 * @param {number} [intervalMs=30000] - How often (in ms) to re-poll.
 */
const useUnreadCount = (user, intervalMs = 30000) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket();

  useEffect(() => {
    // No user → nothing to fetch
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchCount = async () => {
      try {
        const res = await fetch(`/api/messages/unread-total?_t=${Date.now()}`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          if (res.status === 401) return; // Silently ignore auth errors
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.success) setUnreadCount(data.result);
      } catch (err) {
        if (err.name !== "AbortError") {
          // Silently fail — unread count is non-critical
        }
      }
    };

    fetchCount();
    const id = setInterval(fetchCount, intervalMs);

    const handleNewMessage = (msg) => {
      // Optimistically increment if the message is for the current user
      if (msg && msg.receiverId === user._id) {
        setUnreadCount((prev) => prev + 1);
      }
      fetchCount();
    };

    if (socket && user) {
      socket.emit("join_room", { userId: user._id, room: `user_${user._id}` });
      socket.on("receive_message", handleNewMessage);
      socket.on("messages_read", fetchCount);
    }

    return () => {
      clearInterval(id);
      if (socket) {
        socket.off("receive_message", handleNewMessage);
        socket.off("messages_read", fetchCount);
      }
    };
  }, [user, intervalMs, socket]);

  return unreadCount;
};

export default useUnreadCount;
