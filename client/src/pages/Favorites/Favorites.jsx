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

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#1a1a1a] w-full text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 mt-4">
        {/* Sidebar Filters (Static mapping to mock) */}
        <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-10 border-r border-gray-800 pr-4 md:pr-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">By Price</h3>
            <div className="flex flex-col gap-4">
              <input
                type="range"
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
              />
              <div className="flex justify-between text-sm text-gray-400 font-medium tracking-wide">
                <span>$1,300</span>
                <span>Max</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              By Category
            </h3>
            <ul className="flex flex-col gap-4">
              {["Bicycle", "Category", "Mecithorn", "Others"].map((cat) => (
                <li key={cat} className="flex items-center gap-3">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="peer w-5 h-5 rounded-[4px] border-2 border-emerald bg-transparent text-emerald focus:ring-emerald focus:ring-offset-gray-900 cursor-pointer appearance-none checked:bg-emerald"
                    />
                    <svg
                      className="absolute w-5 h-5 text-white p-0.5 pointer-events-none opacity-0 peer-checked:opacity-100"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-300">
                    {cat}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              By Location
            </h3>
            <ul className="flex flex-col gap-4">
              {[
                "Downtown Seattle",
                "Seattle, WA",
                "Seattle, NZ",
                "Seattle, WA2",
              ].map((loc, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="relative flex items-center">
                    <input
                      type="radio"
                      name="location"
                      defaultChecked={i === 0}
                      className="peer w-5 h-5 rounded-full border-2 border-emerald bg-transparent text-emerald focus:ring-emerald focus:ring-offset-gray-900 cursor-pointer appearance-none checked:bg-emerald"
                    />
                    <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 pointer-events-none"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-300">
                    {loc === "Seattle, WA2" ? "Seattle, WA" : loc}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col">
          <div className="mb-8 border-b border-gray-800 pb-6 flex justify-between items-end">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Your Favorites
              </h1>
              <p className="text-emerald font-medium bg-emerald/10 px-3 py-1 rounded-full text-sm inline-block">
                {favorites.length} items
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-10 h-64">
              <p className="text-emerald animate-pulse text-lg font-medium tracking-wide">
                Loading favorites...
              </p>
            </div>
          ) : finalError ? (
            <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl flex flex-col items-center">
              <p className="text-red-400 mb-4">{finalError.toString()}</p>
              <button
                type="button"
                onClick={loadFavorites}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors"
              >
                Retry
              </button>
            </div>
          ) : !favorites.length ? (
            <div className="bg-[#222222] border border-gray-800 p-12 rounded-2xl flex flex-col items-center justify-center text-center h-64">
              <svg
                className="w-16 h-16 text-gray-600 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h2 className="text-xl font-bold text-gray-300 mb-2">
                No favorites yet
              </h2>
              <p className="text-gray-500">
                Save your favorite bikes to compare them easily.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((listing) => (
                <div
                  key={listing._id}
                  className="relative group rounded-2xl overflow-hidden bg-[#222222] border border-gray-800 hover:border-emerald hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300"
                >
                  <ListingCard listing={listing} />

                  <div className="absolute top-4 right-4 z-10 bg-[#1a1a1a]/80 backdrop-blur rounded-full p-2 border border-gray-700">
                    <FavoriteButton
                      listingId={listing._id}
                      variant="icon"
                      onToggled={loadFavorites}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
