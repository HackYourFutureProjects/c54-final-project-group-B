import PropTypes from "prop-types";

const ListingSpecs = ({ listing }) => {
  if (!listing.brand && !listing.condition) return null;

  return (
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
  );
};

ListingSpecs.propTypes = {
  listing: PropTypes.object.isRequired,
};

export default ListingSpecs;
