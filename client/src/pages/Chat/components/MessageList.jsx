import PropTypes from "prop-types";
import MessageBubble from "./MessageBubble";
import styles from "../Chat.module.css";

const MessageList = ({
  user,
  messages,
  isLoadingHistory,
  isFetchingMore,
  isOtherTyping,
  onScroll,
  messagesEndRef,
  onCopyUsername,
  onImageClick,
  copyFeedback,
}) => {
  return (
    <div className={styles.messageList} onScroll={onScroll}>
      {isLoadingHistory && (
        <div className={styles.systemMessage}>Loading history...</div>
      )}

      {isFetchingMore && (
        <div className={styles.systemMessage}>Loading previous messages...</div>
      )}

      {!isLoadingHistory && messages.length === 0 && (
        <div className={styles.systemMessage}>
          This is the beginning of your conversation.
        </div>
      )}

      {messages.map((msg, index) => {
        const isSender =
          msg.senderId?._id === user._id || msg.senderId === user._id;

        // Add date separator if message is on a different day
        let dateSeparator = null;
        if (index > 0) {
          const prevMsgDate = new Date(
            messages[index - 1].createdAt,
          ).toDateString();
          const currMsgDate = new Date(msg.createdAt).toDateString();
          if (prevMsgDate !== currMsgDate) {
            dateSeparator = (
              <div className={styles.dateSeparator} key={`date-${msg._id}`}>
                {currMsgDate}
              </div>
            );
          }
        } else if (messages.length > 0) {
          dateSeparator = (
            <div className={styles.dateSeparator} key={`date-${msg._id}`}>
              {new Date(msg.createdAt).toDateString()}
            </div>
          );
        }

        return (
          <div key={msg._id || index}>
            {dateSeparator}
            <MessageBubble
              msg={msg}
              isSender={isSender}
              onCopyUsername={onCopyUsername}
              onImageClick={onImageClick}
              copyFeedback={copyFeedback}
            />
          </div>
        );
      })}

      {isOtherTyping && (
        <div className={styles.typingIndicator}>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

MessageList.propTypes = {
  user: PropTypes.object.isRequired,
  messages: PropTypes.array.isRequired,
  isLoadingHistory: PropTypes.bool,
  isFetchingMore: PropTypes.bool,
  isOtherTyping: PropTypes.bool,
  onScroll: PropTypes.func.isRequired,
  messagesEndRef: PropTypes.object,
  onCopyUsername: PropTypes.func.isRequired,
  onImageClick: PropTypes.func.isRequired,
  copyFeedback: PropTypes.string,
};

export default MessageList;
