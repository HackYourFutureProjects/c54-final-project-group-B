import PropTypes from "prop-types";
import styles from "../Chat.module.css";

const ImagePreviewModal = ({ url, onClose }) => {
  if (!url) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <button
        className={styles.modalCloseBtn}
        onClick={onClose}
        aria-label="Close preview"
      >
        ✕
      </button>

      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <img src={url} alt="Full size preview" />
      </div>
    </div>
  );
};

ImagePreviewModal.propTypes = {
  url: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default ImagePreviewModal;
