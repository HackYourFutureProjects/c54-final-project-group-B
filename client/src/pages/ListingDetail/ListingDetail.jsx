import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useListingDetail } from "./hooks/useListingDetail";
import ListingSpecs from "./components/ListingSpecs";
import ListingActions from "./components/ListingActions";
import { formatPrice } from "../../utils/formatPrice";
import "../../styles/ListingDetail.css";

const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { listing, loading, error, handleStatusUpdate } = useListingDetail(id);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveImageIndex(0);
  }, [id]);

  if (loading)
    return <div className="listing-detail-container">Loading...</div>;
  if (error)
    return <div className="listing-detail-container">Error: {error}</div>;
  if (!listing) return null;

  const isOwner = user && listing && user?._id === listing.ownerId?._id;
  const displayPrice = formatPrice(listing.price);

  let currency = "EUR";
  if (
    listing.price &&
    typeof listing.price === "object" &&
    typeof listing.price.currency === "string"
  ) {
    currency = listing.price.currency;
  }
  const currencySymbol = currency === "USD" ? "$" : "€";

  const images =
    listing.images && listing.images.length > 0
      ? listing.images
      : ["https://placehold.co/600x400?text=No+Image"];

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="listing-detail-container">
      <Link to="/" className="back-link">
        ← Back to Marketplace
      </Link>

      <div className="listing-content">
        {/* Left Column: Image Carousel */}
        <div className="carousel-container">
          <div className="main-image-wrapper">
            {images.length > 1 && (
              <button
                type="button"
                className="nav-arrow left"
                onClick={prevImage}
                aria-label="Previous image"
              >
                ‹
              </button>
            )}
            <img
              src={images[activeImageIndex]}
              alt={`${listing.title} - View ${activeImageIndex + 1}`}
              className="listing-main-image"
            />
            {images.length > 1 && (
              <button
                type="button"
                className="nav-arrow right"
                onClick={nextImage}
                aria-label="Next image"
              >
                ›
              </button>
            )}
            {listing.status === "sold" && (
              <div className="sold-overlay">SOLD</div>
            )}
          </div>

          {images.length > 1 && (
            <div className="thumbnail-strip">
              {images.map((img, index) => (
                <button
                  type="button"
                  key={index}
                  className={`thumbnail ${index === activeImageIndex ? "active" : ""}`}
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="details-container">
          <div className="listing-header-top">
            {listing.brand && (
              <span className="brand-name">{listing.brand}</span>
            )}
            {listing.status === "sold" && (
              <span className="status-badge sold">Sold</span>
            )}
          </div>

          <h1 className="listing-title">{listing.title}</h1>

          <div className="listing-price">
            {currencySymbol}
            {displayPrice}
          </div>

          <div className="badges">
            {listing.condition && (
              <span className="badge badge-condition">{listing.condition}</span>
            )}
            {listing.location && (
              <span className="badge badge-location">{listing.location}</span>
            )}
          </div>

          <ListingActions
            listing={listing}
            isOwner={isOwner}
            user={user}
            handleStatusUpdate={handleStatusUpdate}
          />

          <div className="seller-info-section">
            <h3 className="seller-info-title">Seller Information</h3>
            <div className="seller-card">
              <div className="seller-avatar">
                {listing.ownerId?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="seller-details">
                <span className="seller-name">
                  {listing.ownerId?.name || "Unknown Seller"}
                </span>
                <span className="seller-email">Verified User</span>
              </div>
            </div>
          </div>

          <ListingSpecs listing={listing} />
        </div>

        {listing.description && (
          <div className="description-section">
            <h3>Description</h3>
            <p className="description-text">{listing.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingDetail;
