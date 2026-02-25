import PropTypes from "prop-types";

const ListingSpecs = ({ listing }) => {
  const specs = [
    { label: "Brand", value: listing.brand },
    { label: "Model", value: listing.model },
    { label: "Category", value: listing.category },
    { label: "Year", value: listing.year },
    { label: "Condition", value: listing.condition },
    {
      label: "Mileage",
      value: listing.mileage != null ? `${listing.mileage} km` : null,
    },
  ];

  const activeSpecs = specs.filter((spec) => spec.value != null);

  if (activeSpecs.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 text-sm md:text-base">
      {activeSpecs.map((spec) => (
        <div key={spec.label} className="flex flex-row">
          <span className="text-gray-400 w-24 flex-shrink-0">
            {spec.label}:
          </span>
          <span className="text-gray-200">{spec.value}</span>
        </div>
      ))}
    </div>
  );
};

ListingSpecs.propTypes = {
  listing: PropTypes.object.isRequired,
};

export default ListingSpecs;
