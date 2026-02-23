import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import { useMessageHistory } from "./hooks/useMessageHistory";
import { useChatSocket } from "./hooks/useChatSocket";
import { useImageUpload } from "./hooks/useImageUpload";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import ImagePreviewModal from "./components/ImagePreviewModal";
import styles from "./Chat.module.css";

const Chat = () => {
  const { id: listingId } = useParams();
  const [searchParams] = useSearchParams();
  const receiverId = searchParams.get("receiverId");
  const { user } = useAuth();
  const navigate = useNavigate();

  const sellerId = receiverId?._id || receiverId;
  const room = `${listingId}_${[user?._id, sellerId].sort().join("_")}`;

  const [newMessage, setNewMessage] = useState("");
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [listing, setListing] = useState(null);

  const { performFetch: fetchListing } = useFetch(
    `/listings/${listingId}`,
    (data) => setListing(data.result),
    (err) => console.error("Failed to load listing:", err),
  );

  useEffect(() => {
    if (listingId) fetchListing();
  }, [listingId]);

  const {
    messages,
    setMessages,
    isLoadingHistory,
    isFetchingMore,
    containerRef,
    messagesEndRef,
    handleScroll,
  } = useMessageHistory(room, user);

  const { isOtherTyping, isOnline, handleTyping, handleSendMessageEvent } =
    useChatSocket(room, user, sellerId, setMessages);

  const { isUploading, uploadProgress, uploadImage } = useImageUpload();

  const handleSendMessage = (messageData) => {
    handleSendMessageEvent({
      room,
      senderId: user._id,
      receiverId: sellerId,
      listingId,
      ...messageData,
    });
  };

  const handleImageUploadWrapper = async (file) => {
    try {
      const optimizedUrl = await uploadImage(file);
      if (optimizedUrl) {
        handleSendMessage({
          content: "[Image]",
          mediaUrl: optimizedUrl,
          mediaType: "image",
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload image. Please check your connection.");
    }
  };

  const handleSendLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let address = "Unknown Location";
        let shortAddress = "Shared Location";

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          if (res.ok) {
            const data = await res.json();
            address = data.display_name;
            const parts = data?.address || {};
            shortAddress =
              parts.road ||
              parts.suburb ||
              parts.city ||
              parts.town ||
              "Current Location";
          }
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
        }

        handleSendMessage({
          content: `[Location: ${shortAddress}]`,
          mediaType: "location",
          location: {
            lat: latitude,
            lng: longitude,
            address: address,
          },
        });
        setIsLocationLoading(false);
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve your location");
        setIsLocationLoading(false);
      },
    );
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

  return (
    <div className={styles.container} ref={containerRef}>
      <ChatHeader
        listing={listing}
        isOnline={isOnline}
        onBack={() => navigate("/inbox")}
      />

      <div className={styles.messagesContainer} onScroll={handleScroll}>
        <MessageList
          user={user}
          messages={messages}
          isLoadingHistory={isLoadingHistory}
          isFetchingMore={isFetchingMore}
          isOtherTyping={isOtherTyping}
          onScroll={handleScroll}
          messagesEndRef={messagesEndRef}
          onCopyUsername={handleCopyUsername}
          onImageClick={setSelectedImageUrl}
          copyFeedback={copyFeedback}
        />
      </div>

      <ChatInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        handleTyping={handleTyping}
        handleImageUpload={handleImageUploadWrapper}
        handleSendLocation={handleSendLocation}
        isUploading={isUploading}
        isLocationLoading={isLocationLoading}
        uploadProgress={uploadProgress}
      />

      <ImagePreviewModal
        url={selectedImageUrl}
        onClose={() => setSelectedImageUrl(null)}
      />
    </div>
  );
};

export default Chat;
