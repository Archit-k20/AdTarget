import { useState } from "react";
import { Eye, Heart, Share2, Calendar, Trash, Edit2 } from "lucide-react"; // <-- Added Edit2
import api from "../api";

// ── Date formatter ────────────────────────────────────────────────────────────

const formatDate = (raw) => {
  if (!raw) return "Recent";
  try {
    // Backend sends a LocalDateTime string: "2024-01-15T10:30:00"
    const date = new Date(raw);
    if (isNaN(date.getTime())) return "Recent";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Recent";
  }
};

// ── Image with fallback ───────────────────────────────────────────────────────

const FALLBACK_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='192' " +
  "viewBox='0 0 400 192'%3E%3Crect width='400' height='192' fill='%23f3f4f6'/%3E" +
  "%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' " +
  "font-family='sans-serif' font-size='14' fill='%239ca3af'%3ENo image%3C/text%3E%3C/svg%3E";

const AdImage = ({ src, alt }) => {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <img
        src={FALLBACK_SRC}
        alt="No image available"
        className="w-full h-48 object-cover"
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
      onError={() => setErrored(true)}
    />
  );
};

// ── AdCard ────────────────────────────────────────────────────────────────────

const AdCard = ({ ad, index, onDelete, showEdit, onEdit, toast }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(ad.likes || 0);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = async () => {
    try {
      const response = await api.post(`/ads/${ad.id}/like`);
      setLikes(response.data.likes);
      setIsLiked((prev) => !prev);
    } catch (error) {
      toast.error("Failed to update like. Please try again.");
    }
  };

  const handleDeleteClick = async () => {
    // Replace window.confirm with an inline disabled state + toast confirmation
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(ad.id);
      // Parent removes card from list — no toast needed here, parent handles it
    } catch {
      toast.error("Failed to delete ad. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/ads/${ad.id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.info("Link copied to clipboard!"))
      .catch(() => toast.error("Could not copy link."));
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden">
        <AdImage src={ad.imageUrl} alt={ad.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* ── Body ── */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
            {ad.title}
          </h3>

          <div className="flex space-x-2">
            {/* Edit (Only shows if showEdit is true) */}
            {showEdit && (
              <button
                onClick={() => onEdit(ad.id)}
                className="p-2 rounded-full text-gray-400 hover:text-green-600 transition-all duration-300 transform hover:scale-110"
                aria-label="Edit ad"
                title="Edit ad"
              >
                <Edit2 size={18} />
              </button>
            )}
            {/* Like */}
            <button
              onClick={handleLike}
              className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                isLiked
                  ? "text-red-500 bg-red-50"
                  : "text-gray-400 hover:text-red-500"
              }`}
              aria-label={isLiked ? "Unlike ad" : "Like ad"}
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            </button>

            {/* Delete */}
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="p-2 rounded-full text-gray-400 hover:text-red-600 transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Delete ad"
              title="Delete ad"
            >
              <Trash size={18} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 rounded-full text-gray-400 hover:text-blue-500 transition-all duration-300 transform hover:scale-110"
              aria-label="Share ad"
              title="Copy link"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        <p className="text-gray-600 mb-4 leading-relaxed">{ad.description}</p>

        {/* Keywords */}
        <div className="flex flex-wrap gap-2 mb-4">
          {ad.keywords?.map((keyword, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors duration-200"
            >
              #{keyword}
            </span>
          ))}
        </div>

        {/* Footer stats */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye size={16} />
              <span>{ad.views || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart size={16} />
              <span>{likes}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar size={16} />
            <span>{formatDate(ad.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdCard;