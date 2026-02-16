import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import "../../styles/ListingDetail.css";
import FavoriteButton from "../../components/FavoriteButton";

const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);

  const {
    isLoading: loading,
    error,
    performFetch,
    cancelFetch,
  } = useFetch(`/listings/${id}`, (response) => {
    setListing(response.result);
  });

  useEffect(() => {
    performFetch();
    return () => cancelFetch();
  }, [id]);

  if (loading)
    return <div className="listing-detail-container">Loading...</div>;
  if (error)
    return <div className="listing-detail-container">Error: {error}</div>;
  if (!listing) return null;

  // Handle price display
  let displayPrice = listing.price;
  if (listing.price && typeof listing.price === "object") {
    if (listing.price.$numberDecimal) {
      displayPrice = listing.price.$numberDecimal;
    } else if (listing.price.value != null) {
      displayPrice = listing.price.value;
    }
  }

  let currency = "EUR";
  if (
    listing.price &&
    typeof listing.price === "object" &&
    typeof listing.price.currency === "string"
  ) {
    currency = listing.price.currency;
  }

  const currencySymbol = currency === "USD" ? "$" : "€";

  const imageUrl =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : "https://placehold.co/600x400?text=No+Image";

  return (
    <div className="listing-detail-container">
      <Link to="/" className="back-link">
        ← Back to Marketplace
      </Link>

      <div className="listing-content">
        {/* Image */}
        <div className="image-container">
          <img src={imageUrl} alt={listing.title} className="listing-image" />
        </div>

        {/* Details */}
        <div className="details-container">
          {listing.brand && <span className="brand-name">{listing.brand}</span>}

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

          <div className="action-buttons">
            <button
              className="btn-contact"
              onClick={() => alert("Contact functionality coming soon!")}
            >
              Contact Seller
            </button>

            <FavoriteButton listingId={listing._id} variant="button" />
          </div>

          <div className="specs-section">
            <h3>Specifications</h3>

            {listing.brand && (
              <div className="spec-row">
                <span className="spec-label">Brand:</span>
                <span className="spec-value">{listing.brand}</span>
              </div>
            )}

            {listing.condition && (
              <div className="spec-row">
                <span className="spec-label">Condition:</span>
                <span className="spec-value">{listing.condition}</span>
              </div>
            )}
          </div>
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
