import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import api from "../api";
import AdCard from "./AdCard";

const AdSearch = ({ toast }) => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  // Track whether we have performed at least one search so we can show "no results"
  const [hasSearched, setHasSearched] = useState(false);

  // Wrap in useCallback so it is stable and can safely go into the useEffect dep array
  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await api.get(`/ads/search?keyword=${encodeURIComponent(keyword)}`);
      if (Array.isArray(res.data.content)) {
        setResults(res.data.content);
      } else {
        setResults([]);
      }
    } catch (err) {
      toast.error("Failed to fetch ads. Please try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, toast]);

  // Load all ads on first render
  useEffect(() => {
    handleSearch();
    // We only want this to fire once on mount — keyword starts empty so this
    // is equivalent to "load all ads". Subsequent searches are triggered by the
    // button or Enter key press.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (adId) => {
    await api.delete(`/ads/${adId}`);
    setResults((prev) => prev.filter((ad) => ad.id !== adId));
    toast.success("Ad deleted.");
  };

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.views || 0) - (a.views || 0);
      case "liked":
        return (b.likes || 0) - (a.likes || 0);
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search ads by title, description, or keywords..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 transition-all duration-200"
            >
              <option value="recent">Recent</option>
              <option value="popular">Popular</option>
              <option value="liked">Most Liked</option>
            </select>

            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 shadow-lg"
              aria-label="Search"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto" />
              ) : (
                <Search size={20} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-lg p-6 animate-pulse"
            >
              <div className="bg-gray-200 h-48 rounded-lg mb-4" />
              <div className="bg-gray-200 h-6 rounded mb-2" />
              <div className="bg-gray-200 h-4 rounded mb-4" />
              <div className="flex gap-2">
                <div className="bg-gray-200 h-6 w-16 rounded-full" />
                <div className="bg-gray-200 h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedResults.map((ad, index) => (
            <AdCard
              key={ad.id ?? index}
              ad={ad}
              index={index}
              onDelete={handleDelete}
              toast={toast}
            />
          ))}
        </div>
      ) : hasSearched ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No ads found.</p>
          {keyword && (
            <p className="text-gray-400 text-sm mt-1">
              Try a different keyword or clear the search to browse all ads.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default AdSearch;