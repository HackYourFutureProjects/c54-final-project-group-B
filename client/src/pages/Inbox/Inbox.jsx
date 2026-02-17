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
  const [view, setView] = useState("active"); // 'active' or 'archived'
  const navigate = useNavigate();

  // Fetch inbox data from the API
  const { isLoading, error, performFetch, cancelFetch } = useFetch(
    `/messages/inbox?archived=${view === "archived"}`,
    (response) => {
      setConversations(response.result || []);
    },
  );

  useEffect(() => {
    performFetch();
    return () => cancelFetch();
  }, [view]);

  const handleArchive = async (e, room, currentStatus) => {
    e.stopPropagation(); // Prevent navigation to chat
    const newStatus = !currentStatus;
    try {
      const res = await fetch(`/api/messages/archive/${room}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setConversations((prev) => prev.filter((c) => c.room !== room));
      }
    } catch (err) {
      console.error("Failed to update archive status:", err);
    }
  };

  // Handle loading and error states
  if (isLoading)
    return <div className={styles.container}>Loading your chats...</div>;
  if (error)
    return <div className={styles.container}>Error loading chats: {error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Conversations</h1>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${view === "active" ? styles.activeTab : ""}`}
          onClick={() => setView("active")}
        >
          Active
        </button>
        <button
          className={`${styles.tab} ${view === "archived" ? styles.activeTab : ""}`}
          onClick={() => setView("archived")}
        >
          Archived
        </button>
      </div>

      <div className={styles.list}>
        {conversations.length === 0 ? (
          <div className={styles.empty}>
            {view === "active"
              ? "No active conversations yet"
              : "No archived conversations"}
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.room}
              className={styles.card}
              onClick={() =>
                navigate(
                  `/chat/${conv.listing?._id}?receiverId=${conv.otherUser?._id}`,
                )
              }
            >
              <div className={styles.cardHeader}>
                <div className={styles.listingInfo}>
                  {conv.unreadCount > 0 && (
                    <div className={styles.unreadDot} title="Unread" />
                  )}
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
                <button
                  className={styles.archiveButton}
                  onClick={(e) =>
                    handleArchive(e, conv.room, view === "archived")
                  }
                  title={
                    view === "active"
                      ? "Archive Conversation"
                      : "Unarchive Conversation"
                  }
                >
                  {view === "active" ? "📥" : "📤"}
                </button>
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
