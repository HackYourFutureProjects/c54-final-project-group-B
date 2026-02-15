import { useEffect, useState } from "react";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/favorites", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.msg || "Failed to load favorites");
        setFavorites([]);
        return;
      }

      setFavorites(data?.result || []);
    } catch (err) {
      console.error(err);
      setError("Network error");
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  if (loading) return <p>Loading favorites...</p>;

  if (error) {
    return (
      <div>
        <p style={{ color: "red" }}>{error}</p>
        <button type="button" onClick={loadFavorites}>
          Retry
        </button>
      </div>
    );
  }

  if (!favorites.length) return <p>No favorites yet.</p>;

  return (
    <div>
      <h1>My Favorites</h1>
      <ul>
        {favorites.map((listing) => (
          <li key={listing._id}>
            {listing.title || listing.name || listing._id}
          </li>
        ))}
      </ul>
    </div>
  );
}
