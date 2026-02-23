import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import FavoriteButton from "../../../components/FavoriteButton";

const ListingActions = ({ listing, isOwner, user, handleStatusUpdate }) => {
  const navigate = useNavigate();

  return (
    <div className="action-buttons">
      {isOwner ? (
        <>
          <button
            className={`btn-status ${listing.status === "sold" ? "btn-undo" : "btn-sold"}`}
            onClick={() =>
              handleStatusUpdate(listing.status === "sold" ? "active" : "sold")
            }
          >
            {listing.status === "sold" ? "Re-activate" : "Mark as Sold"}
          </button>
          <button
            className="btn-edit"
            onClick={() => navigate(`/listings/${listing._id}/edit`)}
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
                  state: { from: `/listings/${listing._id}` },
                });
              } else {
                const sellerId = listing.ownerId?._id || listing.ownerId;
                navigate(`/chat/${listing._id}?receiverId=${sellerId}`);
              }
            }}
          >
            {listing.status === "sold" ? "Item Sold" : "Contact Seller"}
          </button>
          <FavoriteButton listingId={listing._id} variant="button" />
        </>
      )}
    </div>
  );
};

ListingActions.propTypes = {
  listing: PropTypes.object.isRequired,
  isOwner: PropTypes.bool.isRequired,
  user: PropTypes.object,
  handleStatusUpdate: PropTypes.func.isRequired,
};

export default ListingActions;
