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
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
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

    return () => setIsLoadingHistory(false);
  }, [room, user, listingId]);

  // 2. Initialize Socket Connection and Listeners
  useEffect(() => {
    if (!user) return;

    // Connect to the socket server
    socketRef.current = io(window.location.origin);

    // Join the specific conversation room
    socketRef.current.emit("join_room", room);

    // Listen for incoming messages
    socketRef.current.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [room, user]);

  // 3. Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    setNewMessage("");
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
          <h2 className={styles.chatTitle}>{listing?.title || "Chat"}</h2>
          {displayPrice && (
            <span className={styles.listingPrice}>€{displayPrice}</span>
          )}
        </div>
      </div>

      <div className={styles.messagesContainer}>
        {isLoadingHistory ? (
          <div className={styles.loading}>Loading conversation...</div>
        ) : messages.length === 0 ? (
          <div className={styles.empty}>No messages yet. Say hello!</div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                msg.senderId === user._id ? styles.sent : styles.received
              }`}
            >
              <div className={styles.messageText}>{msg.content}</div>
              <div className={styles.timeStamp}>
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className={styles.inputForm}>
        <input
          type="text"
          className={styles.input}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
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
