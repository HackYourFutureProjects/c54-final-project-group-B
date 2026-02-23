import { useRef, useState } from "react";
import PropTypes from "prop-types";
import styles from "../Chat.module.css";

const ChatInput = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleTyping,
  handleImageUpload,
  handleSendLocation,
  isUploading,
  isLocationLoading,
  uploadProgress,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !isUploading && !isLocationLoading) return;
    handleSendMessage({ content: newMessage });
    setNewMessage("");
    setIsMenuOpen(false);
  };

  return (
    <>
      {isUploading && (
        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      <form onSubmit={onSubmit} className={styles.inputForm}>
        <div style={{ position: "relative", display: "flex" }}>
          <button
            type="button"
            className={styles.attachmentButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Attach Media"
          >
            📎
          </button>
          {isMenuOpen && (
            <div className={styles.attachmentMenu}>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsMenuOpen(false);
                }}
              >
                <span className={styles.menuIcon}>🖼️</span> Send Image
              </button>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => {
                  handleSendLocation();
                  setIsMenuOpen(false);
                }}
              >
                <span className={styles.menuIcon}>📍</span> Send Location
              </button>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={async (e) => {
            const file = e.target.files[0];
            if (file) {
              await handleImageUpload(file);
            }
            e.target.value = ""; // reset for future uploads
          }}
          hidden
          accept="image/*"
        />

        <input
          type="text"
          className={styles.input}
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          placeholder={
            isUploading
              ? "Uploading image..."
              : isLocationLoading
                ? "Getting location..."
                : "Type your message..."
          }
          autoComplete="off"
          disabled={isUploading || isLocationLoading}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={!newMessage.trim() || isUploading || isLocationLoading}
        >
          Send
        </button>
      </form>
    </>
  );
};

ChatInput.propTypes = {
  newMessage: PropTypes.string.isRequired,
  setNewMessage: PropTypes.func.isRequired,
  handleSendMessage: PropTypes.func.isRequired,
  handleTyping: PropTypes.func.isRequired,
  handleImageUpload: PropTypes.func.isRequired,
  handleSendLocation: PropTypes.func.isRequired,
  isUploading: PropTypes.bool.isRequired,
  isLocationLoading: PropTypes.bool.isRequired,
  uploadProgress: PropTypes.number.isRequired,
};

export default ChatInput;
