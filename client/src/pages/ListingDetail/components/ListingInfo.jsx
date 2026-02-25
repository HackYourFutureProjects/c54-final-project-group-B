import PropTypes from "prop-types";

const ListingInfo = ({ displayPrice }) => {
  return (
    <div className="flex items-center gap-4 mb-5">
      <span className="text-4xl font-bold text-[#10B981]">${displayPrice}</span>

      {/* Trusted Seller Badge matching mockup exactly */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#10B981] text-[#10B981] bg-transparent text-sm font-semibold tracking-wide">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        Trusted Seller
      </div>
    </div>
  );
};

ListingInfo.propTypes = {
  listing: PropTypes.object.isRequired,
  displayPrice: PropTypes.string.isRequired,
};

export default ListingInfo;
