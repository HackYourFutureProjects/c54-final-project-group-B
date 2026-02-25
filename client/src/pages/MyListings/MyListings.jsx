import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import ListingCard from "../../components/ListingCard";
import { LoadingState } from "../../components/ui";
import EmptyState from "../../components/EmptyState";

const MyListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);

  const { isLoading, error, performFetch } = useFetch(
    `/listings?ownerId=${user?._id}`,
    (response) => {
      setListings(response.result);
    },
  );

  useEffect(() => {
    if (user) {
      performFetch();
    }
  }, [user]);

  if (isLoading) return <LoadingState message="Loading your bikes..." />;
  if (error)
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-red-500">
        Error: {error.toString()}
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-light-bg dark:bg-dark-bg min-h-[calc(100vh-64px)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          My Listings
        </h1>
        <Link to="/listing/create" className="btn-primary w-fit">
          + Sell a Bike
        </Link>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          title="You haven't listed any bikes yet."
          message="Time to clear out the garage?"
          actionLabel="Create your first listing"
          actionLink="/listing/create"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              isOwnerView={true}
              onUpdated={performFetch}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
