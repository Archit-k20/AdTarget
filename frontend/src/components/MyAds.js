import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Inbox } from "lucide-react";
import { getMyAds } from "../api";
import api from "../api";
import AdCard from "./AdCard";

const MyAds = ({ toast }) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadMyAds = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyAds({ size: 50, sort: "createdAt,desc" });
      setAds(response.data.content || []);
    } catch (error) {
      toast.error("Failed to load your ads.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMyAds();
  }, [loadMyAds]);

  const handleDelete = async (id) => {
    await api.delete(`/ads/${id}`);
    setAds((prev) => prev.filter((ad) => ad.id !== id));
    toast.success("Ad deleted successfully");
  };

  const handleEdit = (id) => {
    navigate(`/ads/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Inbox size={48} className="mb-4 text-gray-300" />
        <h3 className="text-xl font-semibold text-gray-700">No Ads Found</h3>
        <p className="mt-2">You haven't created any ads yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {ads.map((ad, index) => (
        <AdCard
          key={ad.id}
          ad={ad}
          index={index}
          onDelete={handleDelete}
          showEdit={true}
          onEdit={handleEdit}
          toast={toast}
        />
      ))}
    </div>
  );
};

export default MyAds;