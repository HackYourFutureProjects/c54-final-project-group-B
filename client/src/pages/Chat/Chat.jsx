import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Chat.module.css";

/**
 * Chat component handles real-time messaging between users.
 * It uses Socket.io for live updates and fetches message history on mount.
 */
const Chat = () => {
  const { id: listingId } = useParams();
  const [searchParams] = useSearchParams();
  const receiverId = searchParams.get("receiverId");
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [listing, setListing] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null); // For "Copied" toast

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Generate a unique room ID based on listing and both participant IDs
  const sellerId = receiverId?._id || receiverId;
  const room = `${listingId}_${[user?._id, sellerId].sort().join("_")}`;

  // 1. Fetch Chat History and Listing Details from the server
  useEffect(() => {
    if (!room || !user) return;

    // Fetch history
    fetch(`/api/messages/${room}`) // Keeping /api/ for standard fetch as per project pattern for non-useFetch calls
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setMessages(data.result);
        }
      })
      .catch((err) => console.error("Failed to load history:", err))
      .finally(() => setIsLoadingHistory(false));

    // Fetch listing info for header context
    fetch(`/api/listings/${listingId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setListing(data.result);
        }
      })
      .catch((err) => console.error("Failed to load listing:", err));
  }, [room, user, listingId]); // Removing 'listingId' from dependency as it's stable from useParams

  // 2. Initialize Socket Connection and Listeners
  useEffect(() => {
    if (!user) return;

    // Connect to the socket server
    socketRef.current = io(window.location.origin);

    // Join the specific conversation room and send user identity
    socketRef.current.emit("join_room", { room, userId: user._id });

    // Initial check for other user's online status
    socketRef.current.emit("check_online_status", sellerId);

    // Listen for incoming messages
    socketRef.current.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
      // If we are actively in the chat, any incoming message should be considered "read"
      // by updating the back-end via a quick call or another mechanism.
      // For now, getMessagesByRoom on mount handles it.
    });

    // Listen for typing status
    socketRef.current.on("typing_status", (data) => {
      if (data.userId !== user._id) {
        setIsOtherTyping(data.isTyping);
      }
    });

    // Listen for online status changes
    socketRef.current.on("user_status_change", (data) => {
      if (data.userId === sellerId) {
        setIsOnline(data.status === "online");
      }
    });

    socketRef.current.on("online_status_result", (data) => {
      if (data.userId === sellerId) {
        setIsOnline(data.isOnline);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [room, user, sellerId]);

  // 3. Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = () => {
    if (!socketRef.current || !user || !room) return;

    socketRef.current.emit("typing", { room, userId: user._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("stop_typing", { room, userId: user._id });
    }, 3000);
  };

  const handleScroll = () => {
    if (!containerRef.current || isFetchingMore || !hasMore) return;

    if (containerRef.current.scrollTop === 0) {
      // Fetch older messages
      setIsFetchingMore(true);
      const oldestMessageTime = messages[0]?.createdAt;

      fetch(`/api/messages/${room}?before=${oldestMessageTime}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (data.result.length === 0) {
              setHasMore(false);
            } else {
              setMessages((prev) => [...data.result, ...prev]);
            }
          }
        })
        .catch((err) => console.error("Failed to load more messages:", err))
        .finally(() => setIsFetchingMore(false));
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageData = {
      room,
      senderId: user._id,
      receiverId: sellerId,
      listingId,
      content: newMessage,
    };

    // Send via socket for real-time update
    socketRef.current.emit("send_message", messageData);
    socketRef.current.emit("stop_typing", { room, userId: user._id });
    socketRef.current.emit("stop_typing", { room, userId: user._id });
    setNewMessage("");
  };

  const handleCopyUsername = (username) => {
    if (!username) return;
    navigator.clipboard.writeText(username).then(() => {
      setCopyFeedback(username);
      setTimeout(() => setCopyFeedback(null), 2000);
    });
  };

  if (!user) {
    return (
      <div className={styles.chatError}>
        <p>Please log in to chat.</p>
        <button onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  // Handle price display logic locally
  let displayPrice = listing?.price;
  if (listing?.price && typeof listing.price === "object") {
    if (listing.price.$numberDecimal) {
      displayPrice = listing.price.$numberDecimal;
    } else if (listing.price.value != null) {
      displayPrice = listing.price.value;
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.chatHeader}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/inbox")}
        >
          ← Back
        </button>
        <div className={styles.headerInfo}>
          <h2 className={styles.chatTitle}>
            <span className={isOnline ? styles.onlineDot : styles.offlineDot} />
            {listing?.title || "Chat"}
          </h2>
          {displayPrice && (
            <span className={styles.listingPrice}>€{displayPrice}</span>
          )}
        </div>
      </div>

      <div
        className={styles.messagesContainer}
        ref={containerRef}
        onScroll={handleScroll}
      >
        {isFetchingMore && (
          <div className={styles.loadingMore}>Loading history...</div>
        )}
        {isLoadingHistory ? (
          <div className={styles.loading}>Loading conversation...</div>
        ) : messages.length === 0 ? (
          <div className={styles.empty}>No messages yet. Say hello!</div>
        ) : (
          messages.map((msg, index) => {
            const isSender = (msg.senderId._id || msg.senderId) === user._id;
            const senderName = msg.senderId.name || "User";

            return (
              <div
                key={index}
                className={`${styles.message} ${
                  isSender ? styles.sent : styles.received
                }`}
              >
                {!isSender && (
                  <div
                    className={styles.senderName}
                    onClick={() => handleCopyUsername(senderName)}
                    title="Click to copy username"
                  >
                    {senderName}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.copyIcon}
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    {copyFeedback === senderName && (
                      <span className={styles.copyFeedback}>Copied!</span>
                    )}
                  </div>
                )}
                <div className={styles.messageText}>{msg.content}</div>
                <div className={styles.timeStamp}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })
        )}
        {isOtherTyping && (
          <div className={styles.typingIndicator}>Someone is typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className={styles.inputForm}>
        <input
          type="text"
          className={styles.input}
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type your message..."
          autoComplete="off"
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
