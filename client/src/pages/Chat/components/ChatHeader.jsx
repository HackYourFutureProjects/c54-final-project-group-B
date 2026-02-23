import PropTypes from "prop-types";
import { formatPrice } from "../../../utils/formatPrice";
import styles from "../Chat.module.css";

const ChatHeader = ({ listing, isOnline, onBack }) => {
  const displayPrice = formatPrice(listing?.price);

  return (
    <header className={styles.chatHeader}>
      <div className={styles.headerLeft}>
        <button className={styles.backButton} onClick={onBack}>
          ← Back
        </button>
        <div className={styles.listingContext}>
          <div className={styles.imageWrapper}>
            {listing?.images?.[0] ? (
              <img
                src={listing.images[0]}
                alt="Listing thumbnail"
                className={styles.listingThumbnail}
              />
            ) : (
              <div className={styles.listingThumbnailPlaceholder} />
            )}
            {isOnline && (
              <div className={styles.onlineStatusDot} title="User is online" />
            )}
          </div>
          <div className={styles.listingText}>
            <h2>{listing?.title || "Loading..."}</h2>
            <span className={styles.priceBadge}>{displayPrice} €</span>
          </div>
        </div>
      </div>
    </header>
  );
};

ChatHeader.propTypes = {
  listing: PropTypes.object,
  isOnline: PropTypes.bool,
  onBack: PropTypes.func.isRequired,
};

export default ChatHeader;
