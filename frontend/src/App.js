import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Search, Plus, List, LogOut, FolderHeart, User } from "lucide-react";

import AdForm from "./components/AdForm";
import AdList from "./components/AdList";
import AdSearch from "./components/AdSearch";
import Auth from "./components/Auth";
import PrivateRoute from "./components/PrivateRoute";
import { ToastContainer, useToast } from "./components/Toast";

// New imports
import MyAds from "./components/MyAds";
import UserProfile from "./components/UserProfile";
import AdDetailPage from "./components/AdDetailPage";

import "./index.css";

// ── Navigation tab config ─────────────────────────────────────────────────────

const TABS = [
  { id: "create",  label: "Create Ad", icon: Plus },
  { id: "list",    label: "All Ads",   icon: List },
  { id: "search",  label: "Search",    icon: Search },
  { id: "myads",   label: "My Ads",    icon: FolderHeart },
  { id: "profile", label: "Profile",   icon: User },
];

// ── MainContent is defined OUTSIDE App so React never recreates it ─────────────

const MainContent = ({ onLogout, toast }) => {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Ad Management Portal
            </h1>
            <p className="text-gray-600 text-lg">
              Create, manage, and discover amazing advertisements
            </p>
          </div>

          {/* Navigation tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-2">
              <div className="flex space-x-1">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                      activeTab === id
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}

                {/* Logout */}
                <button
                  onClick={onLogout}
                  className="flex items-center justify-center px-4 py-3 rounded-xl font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
                  title="Logout"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline ml-2">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[600px]">
            {activeTab === "create"  && <AdForm toast={toast} />}
            {activeTab === "list"    && <AdList toast={toast} />}
            {activeTab === "search"  && <AdSearch toast={toast} />}
            {activeTab === "myads"   && <MyAds toast={toast} />}
            {activeTab === "profile" && <UserProfile toast={toast} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toasts, toast, remove } = useToast();

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <Auth
                mode="login"
                setIsAuthenticated={setIsAuthenticated}
                toast={toast}
              />
            }
          />
          <Route
            path="/register"
            element={
              <Auth
                mode="register"
                setIsAuthenticated={setIsAuthenticated}
                toast={toast}
              />
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainContent onLogout={handleLogout} toast={toast} />
              </PrivateRoute>
            }
          />
          
          {/* NEW ROUTE FOR AD DETAIL/EDIT */}
          <Route 
            path="/ads/:id" 
            element={
              <PrivateRoute>
                <AdDetailPage toast={toast} />
              </PrivateRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>

      {/* Toast notifications rendered outside the Router so they survive route transitions */}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </>
  );
}

export default App;