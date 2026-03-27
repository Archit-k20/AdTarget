import { useState, useEffect } from "react";
import { User, Mail, Heart, LayoutList, ShieldAlert } from "lucide-react";
import { getUserProfile } from "../api";

const UserProfile = ({ toast }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        setProfile(response.data);
      } catch (error) {
        toast.error("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl flex items-center space-x-6">
        <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
          <User size={64} className="text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-2">
            {profile.firstname} {profile.lastname}
          </h2>
          <div className="flex items-center space-x-4 opacity-90">
            <span className="flex items-center space-x-2">
              <Mail size={16} />
              <span>{profile.email}</span>
            </span>
            <span className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-sm">
              <ShieldAlert size={14} />
              <span className="capitalize">{profile.role?.toLowerCase() || 'User'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <LayoutList size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Ads Created</p>
            <p className="text-2xl font-bold text-gray-800">{profile.adCount || 0}</p>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 flex items-center space-x-4">
          <div className="bg-purple-100 p-3 rounded-full text-purple-600">
            <Heart size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Likes Received</p>
            <p className="text-2xl font-bold text-gray-800">{profile.totalLikes || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;