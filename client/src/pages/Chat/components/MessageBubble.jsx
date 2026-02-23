import PropTypes from "prop-types";
import { toTimeString } from "../../../utils/formatDate";
import styles from "../Chat.module.css";

const MessageBubble = ({
  msg,
  isSender,
  onCopyUsername,
  onImageClick,
  copyFeedback,
}) => {
  return (
    <div
      className={`${styles.messageWrapper} ${isSender ? styles.sender : styles.receiver}`}
    >
      {!isSender && msg.senderId?.name && (
        <div
          className={styles.messageSender}
          onClick={() => onCopyUsername(msg.senderId.name)}
          title="Click to copy username"
        >
          {msg.senderId.name}
          {copyFeedback === msg.senderId.name && (
            <span className={styles.copyFeedback}>Copied!</span>
          )}
        </div>
      )}

      <div className={styles.messageBubble}>
        {/* Render location */}
        {msg.mediaType === "location" && msg.location ? (
          <div className={styles.locationMessage}>
            📍 <strong>Shared Location</strong>
            <br />
            {msg.location.address}
            <div className={styles.mapLink}>
              <a
                href={`https://www.openstreetmap.org/?mlat=${msg.location.lat}&mlon=${msg.location.lng}#map=16/${msg.location.lat}/${msg.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Map
              </a>
            </div>
          </div>
        ) : msg.mediaType === "image" && msg.mediaUrl ? (
          /* Render image */
          <div className={styles.imageMessage}>
            <img
              src={msg.mediaUrl}
              alt="Shared image"
              onClick={() => onImageClick(msg.mediaUrl)}
              className={styles.clickableImage}
            />
            {msg.content !== "[Image]" && msg.content && (
              <p className={styles.imageCaption}>{msg.content}</p>
            )}
          </div>
        ) : (
          /* Render plain text */
          <p>{msg.content}</p>
        )}
      </div>

      <div className={styles.timeStamp}>{toTimeString(msg.createdAt)}</div>
    </div>
  );
};

MessageBubble.propTypes = {
  msg: PropTypes.object.isRequired,
  isSender: PropTypes.bool.isRequired,
  onCopyUsername: PropTypes.func.isRequired,
  onImageClick: PropTypes.func.isRequired,
  copyFeedback: PropTypes.string,
};

export default MessageBubble;
