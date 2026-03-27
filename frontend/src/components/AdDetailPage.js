import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, X, Eye, Heart, Calendar } from "lucide-react";
import { getAdById, updateAd } from "../api";

const AdDetailPage = ({ toast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", keywords: "", image: null });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await getAdById(id);
        const data = response.data;
        setAd(data);
        setForm({
          title: data.title || "",
          description: data.description || "",
          keywords: data.keywords?.join(", ") || "",
          image: null
        });
        setImagePreview(data.imageUrl);
      } catch (error) {
        toast.error("Ad not found or failed to load.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchAd();
  }, [id, navigate, toast]);

  // Handle Form changes
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const applyFile = (file) => {
    if (!file) return;
    setForm({ ...form, image: file });
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setForm({ ...form, image: null });
    setImagePreview(ad.imageUrl); // Revert to original on cancel
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("keywords", form.keywords);
    if (form.image) formData.append("image", form.image);

    try {
      const response = await updateAd(id, formData);
      setAd(response.data);
      setIsEditing(false);
      toast.success("Ad updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update ad.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between text-white">
          <button onClick={() => navigate(-1)} className="flex items-center space-x-2 hover:text-blue-200 transition">
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="space-x-4">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition">
                Edit Ad
              </button>
            ) : (
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-red-500/80 rounded-lg hover:bg-red-500 transition">
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="p-8">
          {/* View Mode */}
          {!isEditing ? (
            <div className="space-y-6">
              {ad.imageUrl && <img src={ad.imageUrl} alt={ad.title} className="w-full h-64 object-cover rounded-xl shadow-md" />}
              <h1 className="text-3xl font-bold text-gray-800">{ad.title}</h1>
              <p className="text-gray-600 whitespace-pre-wrap">{ad.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {ad.keywords?.map((k, i) => <span key={i} className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">#{k}</span>)}
              </div>

              <div className="flex items-center space-x-6 text-gray-500 border-t pt-4 mt-6">
                <span className="flex items-center space-x-1"><Eye size={18}/> <span>{ad.views || 0} views</span></span>
                <span className="flex items-center space-x-1"><Heart size={18}/> <span>{ad.likes || 0} likes</span></span>
                <span className="flex items-center space-x-1"><Calendar size={18}/> <span>{new Date(ad.createdAt).toLocaleDateString()}</span></span>
              </div>
            </div>
          ) : (
            <div>
              {/* Edit Mode Form (Styled identically to AdForm) */}
              <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <input name="title" value={form.title} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500" required placeholder="Title" />
                  <textarea name="description" value={form.description} onChange={handleChange} rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500" required placeholder="Description" />
                  <input name="keywords" value={form.keywords} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500" required placeholder="Keywords (comma separated)" />
                </div>

                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition">
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="h-48 w-full object-cover rounded-lg" />
                        <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <label className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                          Upload new image
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => applyFile(e.target.files[0])} />
                        </label>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 text-center">Uploading a new image will replace the existing one.</p>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition">
                {isSubmitting ? "Saving..." : <span className="flex justify-center items-center space-x-2"><Save size={20}/> <span>Save Changes</span></span>}
              </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdDetailPage;