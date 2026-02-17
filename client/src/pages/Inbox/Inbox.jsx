import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import styles from "./Inbox.module.css";

/**
 * Inbox component displays a list of all active conversations for the logged-in user.
 * It shows the latest message and details about the listing and the other participant.
 */
const Inbox = () => {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  // Fetch inbox data from the API
  const { isLoading, error, performFetch, cancelFetch } = useFetch(
    "/messages/inbox",
    (response) => {
      setConversations(response.result || []);
    },
  );

  useEffect(() => {
    performFetch();
    return () => cancelFetch();
  }, []);

  // Handle loading and error states
  if (isLoading)
    return <div className={styles.container}>Loading your chats...</div>;
  if (error)
    return <div className={styles.container}>Error loading chats: {error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Conversations</h1>
      <div className={styles.list}>
        {conversations.length === 0 ? (
          <div className={styles.empty}>No conversations yet</div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.room}
              className={styles.card}
              // Navigate to the chat page for the specific listing and user
              onClick={() =>
                navigate(
                  `/chat/${conv.listing?._id}?receiverId=${conv.otherUser?._id}`,
                )
              }
            >
              <div className={styles.listingInfo}>
                <img
                  src={conv.listing?.images?.[0] || "/placeholder.png"}
                  alt={conv.listing?.title || "Listing"}
                  className={styles.listingImage}
                />
                <div className={styles.userInfo}>
                  <h3 className={styles.otherUserName}>
                    {conv.otherUser?.name || "Unknown User"}
                  </h3>
                  <p className={styles.listingTitle}>
                    {conv.listing?.title || "Untitled Listing"}
                  </p>
                </div>
              </div>

              <div className={styles.lastMessage}>
                <p className={styles.messagePreview}>
                  {conv.lastMessage?.content || "No message content"}
                </p>
                <span className={styles.timeStamp}>
                  {conv.lastMessage?.createdAt
                    ? new Date(conv.lastMessage.createdAt).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Inbox;
