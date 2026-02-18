import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import ListingCard from "../../components/ListingCard";
import FavoriteButton from "../../components/FavoriteButton";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [localError, setLocalError] = useState("");

  const { isLoading, error, performFetch, cancelFetch } = useFetch(
    "/favorites",
    (data) => {
      setFavorites(data?.result || []);
    },
  );

  const loadFavorites = async () => {
    setLocalError("");
    try {
      await performFetch({
        method: "GET",
        credentials: "include",
      });
    } catch (err) {
      console.error(err);
      setLocalError("Failed to load favorites");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadFavorites();
    };

    fetchData();

    return () => cancelFetch();
  }, []);

  const finalError = localError || error;

  if (isLoading) return <p>Loading favorites...</p>;

  if (finalError) {
    return (
      <div>
        <p style={{ color: "red" }}>{finalError.toString()}</p>
        <button type="button" onClick={loadFavorites}>
          Retry
        </button>
      </div>
    );
  }

  if (!favorites.length) return <p>No favorites yet.</p>;

  return (
    <div className="home-container">
      <h1>My Favorites</h1>

      <div className="listing-grid">
        {favorites.map((listing) => (
          <div key={listing._id} style={{ position: "relative" }}>
            <ListingCard listing={listing} />

            <div style={{ marginTop: 8 }}>
              <FavoriteButton
                listingId={listing._id}
                variant="button"
                onToggled={loadFavorites}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
