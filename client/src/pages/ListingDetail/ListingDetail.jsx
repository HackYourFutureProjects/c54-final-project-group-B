import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import "../../styles/ListingDetail.css";

const ListingDetail = () => {
  /* Step 1: Initialize State */
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
  if (!listing) return null; // or a "Not Found" component

  // Handle price display logic locally
  const displayPrice = listing.price;
  const currencySymbol = "€";

  const handleStatusUpdate = async (newStatus) => {
    try {
      const res = await fetch(`/api/listings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setListing(data.listing);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const isOwner = user && listing.ownerId._id === user._id;

  const imageUrl =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : "https://placehold.co/600x400?text=No+Image";

  return (
    <div className="listing-detail-container">
      {/* Back Link */}
      <Link to="/" className="back-link">
        ← Back to Marketplace
      </Link>

      <div className="listing-content">
        {/* Left Column: Image */}
        <div className="image-container">
          <img src={imageUrl} alt={listing.title} className="listing-image" />
          {listing.status === "sold" && (
            <div className="sold-overlay">SOLD</div>
          )}
        </div>

        {/* Right Column: Details */}
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
              <span className="badge badge-location">
                <span aria-hidden="true">📍</span> {listing.location}
              </span>
            )}
          </div>

          <div className="action-buttons">
            {isOwner ? (
              <>
                <button
                  className={`btn-status ${listing.status === "sold" ? "btn-undo" : "btn-sold"}`}
                  onClick={() =>
                    handleStatusUpdate(
                      listing.status === "sold" ? "active" : "sold",
                    )
                  }
                >
                  {listing.status === "sold" ? "Re-activate" : "Mark as Sold"}
                </button>
                <button
                  className="btn-edit"
                  onClick={() => navigate(`/listings/${id}/edit`)}
                >
                  Edit Listing
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn-contact"
                  disabled={listing.status === "sold"}
                  onClick={() => {
                    if (!user) {
                      navigate("/login", {
                        state: { from: `/listings/${id}` },
                      });
                    } else {
                      const sellerId = listing.ownerId?._id || listing.ownerId;
                      navigate(`/chat/${id}?receiverId=${sellerId}`);
                    }
                  }}
                >
                  {listing.status === "sold" ? "Item Sold" : "Contact Seller"}
                </button>
                <button
                  className="btn-favorite"
                  onClick={() => alert("Added to favorites!")}
                >
                  Add to Favorites
                </button>
              </>
            )}
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

        {/* Description Section */}
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
