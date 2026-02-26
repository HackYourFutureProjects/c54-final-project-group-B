import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import useFetch from "../../hooks/useFetch";
import Skeleton from "../../components/Skeleton/Skeleton.jsx";
import TEST_ID from "./Home.testid";
import QuickViewDrawer from "../../components/QuickViewDrawer/QuickViewDrawer.jsx";

const ListingCard = lazy(() => import("../../components/ListingCard.jsx"));
const HeroFilter = lazy(
  () => import("../../components/HeroFilter/HeroFilter.jsx"),
);
import BicycleLoading from "../../components/ui/BicycleLoading";

const Home = () => {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const query = useMemo(() => {
    const params = new URLSearchParams({
      page,
      limit: 12,
      search: debouncedSearchTerm,
    });
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.minYear) params.append("minYear", filters.minYear);
    if (filters.maxYear) params.append("maxYear", filters.maxYear);

    // Use categories from filters
    const cats = filters.category?.length ? filters.category : [];
    if (cats.length) params.append("category", cats.join(","));

    if (filters.condition?.length)
      params.append("condition", filters.condition.join(","));
    if (filters.location) params.append("location", filters.location);
    if (filters.lat) params.append("lat", filters.lat);
    if (filters.lng) params.append("lng", filters.lng);
    if (filters.radius) params.append("radius", filters.radius);
    return params.toString();
  }, [page, debouncedSearchTerm, filters]);

  const { isLoading, error, performFetch, cancelFetch } = useFetch(
    `/listings?${query}`,
    (response) => {
      if (page === 1) {
        setListings(response.result);
      } else {
        setListings((prev) => [...prev, ...response.result]);
      }
      setHasMore(response.hasMore);
    },
  );

  useEffect(() => {
    performFetch();
    return () => cancelFetch();
  }, [page, debouncedSearchTerm, filters]);

  const handleLoadMore = () => setPage((prev) => prev + 1);
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };
  const handleClearSearch = () => setSearchTerm("");
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setIsFilterOpen(false);
  };
  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const activeFilterCount = Object.keys(filters).filter((key) => {
    if (["lat", "lng", "radius"].includes(key)) return false;
    const val = filters[key];
    if (Array.isArray(val)) return val.length > 0;
    if (val === null || val === undefined || val === "") return false;
    return true;
  }).length;

  return (
    <div
      className="w-full min-h-screen bg-[#FAFAF8] dark:bg-[#121212] pb-24"
      data-testid={TEST_ID.container}
    >
      {/* Hero — full-bleed cycling image */}
      <div
        className="relative overflow-hidden text-white text-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-[#FAFAF8] dark:from-gray-950/70 dark:via-gray-950/50 dark:to-[#121212]" />

        <div className="relative z-10 px-4 pt-14 pb-20 sm:pt-20 sm:pb-28 max-w-4xl mx-auto">
          <p className="text-emerald-400 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] mb-3">
            Pre-loved bicycle marketplace
          </p>
          <h1 className="text-4xl sm:text-6xl font-black mb-4 tracking-tight leading-[1.1]">
            Every ride
            <br />
            <span className="text-emerald-400">starts here.</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-lg mb-10 max-w-lg mx-auto">
            Buy and sell quality second-hand bikes in your area. Road, mountain,
            city, e-bikes &amp; more.
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search bikes, brands, locations..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-4 text-sm sm:text-base rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none transition-all shadow-xl shadow-black/5 focus:bg-white/20 dark:focus:bg-white/15 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar - Desktop Only */}
          <aside className="hidden md:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
                  Filters
                </h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-[10px] font-bold text-emerald-500 hover:text-emerald-600 transition-colors uppercase tracking-widest"
                  >
                    Reset
                  </button>
                )}
              </div>
              <Suspense
                fallback={
                  <div className="h-96 w-full bg-gray-100 dark:bg-white/5 animate-pulse rounded-3xl" />
                }
              >
                <HeroFilter
                  isOpen={true}
                  filters={filters}
                  onApply={handleApplyFilters}
                  onClear={handleClearFilters}
                  onClearSearch={handleClearSearch}
                  isSidebar={true}
                />
              </Suspense>
            </div>
          </aside>

          {/* Mobile Filter Modal */}
          {isFilterOpen && (
            <div className="fixed inset-0 z-50 md:hidden bg-white dark:bg-[#121212] flex flex-col animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#2a2a2a]">
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm">
                  Filters
                </h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <HeroFilter
                  isOpen={true}
                  filters={filters}
                  onApply={handleApplyFilters}
                  onClear={handleClearFilters}
                  onClearSearch={handleClearSearch}
                  isSidebar={true}
                  searchTerm={searchTerm}
                  onSearchChange={handleSearch}
                />
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Section header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {debouncedSearchTerm
                      ? `Results for "${debouncedSearchTerm}"`
                      : activeFilterCount > 0
                        ? "Filtered Results"
                        : "Featured Bikes"}
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    {listings.length > 0
                      ? `Showing ${listings.length} bike${listings.length !== 1 ? "s" : ""} available now`
                      : "No bikes found with current criteria"}
                  </p>
                </div>

                {/* Mobile Filter Trigger */}
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="md:hidden flex items-center gap-2.5 px-5 py-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 shadow-sm active:scale-95 transition-all"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" y1="21" x2="4" y2="14" />
                    <line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" />
                    <line x1="20" y1="12" x2="20" y2="3" />
                  </svg>
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-emerald-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Listings grid */}
            <div>
              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-center font-medium mb-6">
                  Error loading listings: {error.toString()}
                </div>
              )}

              {isLoading && page === 1 && (
                <div className="min-h-[40vh] flex items-center justify-center">
                  <BicycleLoading message="Scanning the bike shed..." />
                </div>
              )}

              {!isLoading && !error && listings.length === 0 && (
                <div className="text-center py-20 px-4">
                  <div className="flex justify-center mb-4 text-gray-300 dark:text-gray-700">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {debouncedSearchTerm || activeFilterCount > 0
                      ? "No bikes match your search"
                      : "No bikes listed yet"}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm mx-auto">
                    {debouncedSearchTerm || activeFilterCount > 0
                      ? "Try a different filter or search term."
                      : "Be the first to list your ride and kickstart the community!"}
                  </p>
                </div>
              )}

              <div
                className="grid gap-5"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                }}
              >
                <Suspense
                  fallback={
                    <>
                      {[...Array(8)].map((_, i) => (
                        <Skeleton key={`lazy-skeleton-${i}`} type="card" />
                      ))}
                    </>
                  }
                >
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing._id}
                      listing={listing}
                      onQuickView={setSelectedListing}
                    />
                  ))}
                </Suspense>
              </div>

              {hasMore && (
                <div className="text-center mt-12 pb-8">
                  <button
                    className="px-10 py-3.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold rounded-full shadow-lg shadow-emerald-600/20 dark:shadow-emerald-500/20 transition-all text-sm disabled:opacity-50"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Loading...
                      </div>
                    ) : (
                      "Show More Bikes"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick View Drawer ── */}
      <QuickViewDrawer
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
      />
    </div>
  );
};

export default Home;
