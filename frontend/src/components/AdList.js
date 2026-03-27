import { useState, useEffect } from "react";
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api";
import AdCard from "./AdCard";

const AdList = ({ toast }) => {
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState("createdAt,desc");
  const [totalElements, setTotalElements] = useState(0);

  const fetchAds = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/ads?page=${page}&sort=${sort}`);
      setAds(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (error) {
      toast.error("Failed to load ads. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch whenever page or sort order changes
  useEffect(() => {
    fetchAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort]);

  const handlePrevPage = () => {
    if (page > 0) setPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage((p) => p + 1);
  };

  // Returns a promise so AdCard can re-enable its delete button on failure
  const handleDelete = async (adId) => {
    await api.delete(`/ads/${adId}`);
    setAds((prev) => prev.filter((ad) => ad.id !== adId));
    toast.success("Ad deleted.");
  };

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
          <TrendingUp className="text-blue-600" />
          <span>All Advertisements</span>
        </h2>
        <div className="flex items-center space-x-4">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(0); // Reset to page 1 when changing sort
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="createdAt,desc">Newest First</option>
            <option value="createdAt,asc">Oldest First</option>
            <option value="likes,desc">Most Liked</option>
            <option value="views,desc">Most Viewed</option>
          </select>
          <div className="text-sm text-gray-500">
            Showing {ads.length} of {totalElements} ads
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
      ) : ads.length === 0 ? (
        <div className="text-center py-16">
          <TrendingUp className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No ads found.</p>
          <p className="text-gray-400 text-sm mt-1">
            Create the first one using the Create Ad tab.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad, index) => (
              <AdCard
                key={ad.id}
                ad={ad}
                index={index}
                onDelete={handleDelete}
                toast={toast}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={handlePrevPage}
                disabled={page === 0}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  page === 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                <ChevronLeft className="mr-1" />
                Previous
              </button>
              <div className="text-gray-600">
                Page {page + 1} of {totalPages}
              </div>
              <button
                onClick={handleNextPage}
                disabled={page >= totalPages - 1}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  page >= totalPages - 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                Next
                <ChevronRight className="ml-1" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdList;