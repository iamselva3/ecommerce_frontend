import React, { useEffect, useState } from "react";
import { 
  Users, Image, Star, Upload, Package, 
  ShoppingBag, TrendingUp, Eye, Calendar,
  ChevronRight, PlusCircle, Settings, LogOut,
  BarChart3, AlertCircle, CheckCircle, XCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [latestImages, setLatestImages] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    fetchDashboardData();
  }, [token, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchLatestImages(),
        fetchUserStats()
      ]);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/images/stats/images`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setStats(data.data);
    } catch {
      toast.error("Failed to load stats");
    }
  };

  const fetchLatestImages = async () => {
    try {
      const res = await fetch(`${API_URL}/api/images/latest/images`);
      const data = await res.json();
      
      // Handle different response structures
      const images = data?.data?.images || data?.data?.data || data?.data || [];
      setLatestImages(images.slice(0, 6)); // Show only 6 latest
    } catch {
      toast.error("Failed to load latest uploads");
    }
  };

  const fetchUserStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      const result = await res.json();
      const usersArray = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.data?.users)
        ? result.data.users
        : [];

      const totalUsers = usersArray.length;
      const activeUsers = usersArray.filter(u => u.isActive !== false).length;
      const newThisMonth = usersArray.filter(u => {
        const createdDate = new Date(u.createdAt);
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return createdDate >= firstDayOfMonth;
      }).length;

      setUserStats({
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newThisMonth
      });
    } catch {
      console.error("Failed to fetch user stats");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success("Dashboard refreshed");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Package className="text-blue-600" size={28} />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-semibold">{user.name || user.email || 'Admin'}</span>
              </span>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <TrendingUp size={20} className={refreshing ? "animate-spin text-blue-600" : ""} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => navigate("/admin/products/new")}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Add New Product
          </button>
          <button
            onClick={() => navigate("/admin/upload")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Upload size={20} />
            Bulk Upload
          </button>
          <button
            onClick={() => navigate("/admin/featured")}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
          >
            <Star size={20} />
            Manage Featured
          </button>
        </div>

        {/* Stats Cards Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Products"
              value={stats.totalImages || 0}
              icon={<Package className="text-blue-600" size={24} />}
              bgColor="bg-blue-50"
              trend="+12%"
            />
            <StatCard
              title="Featured Products"
              value={stats.featuredImages || 0}
              icon={<Star className="text-yellow-600" size={24} />}
              bgColor="bg-yellow-50"
              trend={stats.featuredImages ? `${Math.round((stats.featuredImages / (stats.totalImages || 1)) * 100)}% of total` : "0%"}
            />
            <StatCard
              title="Categories"
              value={stats.totalCategories || 0}
              icon={<Image className="text-purple-600" size={24} />}
              bgColor="bg-purple-50"
            />
            <StatCard
              title="Total Users"
              value={userStats?.total || 0}
              icon={<Users className="text-green-600" size={24} />}
              bgColor="bg-green-50"
              subtext={`${userStats?.active || 0} active`}
            />
          </div>
        )}

        {/* Additional Stats Row */}
        {userStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <SimpleStatCard
              title="Active Users"
              value={userStats.active}
              icon={<CheckCircle className="text-green-600" size={20} />}
              color="green"
            />
            <SimpleStatCard
              title="Inactive Users"
              value={userStats.total - userStats.active}
              icon={<XCircle className="text-red-600" size={20} />}
              color="red"
            />
            <SimpleStatCard
              title="New This Month"
              value={userStats.newThisMonth}
              icon={<Calendar className="text-blue-600" size={20} />}
              color="blue"
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Uploads - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Upload size={20} className="text-blue-600" />
                  Latest Uploads
                </h2>
                <button
                  onClick={() => navigate("/admin/products")}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View All <ChevronRight size={16} />
                </button>
              </div>

              {latestImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {latestImages.map((img, index) => (
                    <div
                      key={img._id || index}
                      className="group relative bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate(`/admin/products/edit/${img._id}`)}
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={img.signedUrl || img.url || img.images?.[0]?.url || "https://via.placeholder.com/300x300?text=No+Image"}
                          alt={img.name || "Product"}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye size={24} className="text-white" />
                      </div>
                      <div className="p-2">
                        <p className="text-sm font-medium truncate">{img.name || "Unnamed"}</p>
                        <p className="text-xs text-gray-500">{formatDate(img.createdAt)}</p>
                      </div>
                      {img.isFeatured && (
                        <span className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Star size={10} className="fill-white" />
                          Featured
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
                  <p className="text-gray-600 mb-4">Get started by uploading your first product</p>
                  <button
                    onClick={() => navigate("/admin/products/new")}
                    className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <PlusCircle size={18} />
                    Add Product
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links and Info - Takes 1 column */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings size={20} className="text-gray-600" />
                Quick Links
              </h2>
              <div className="space-y-2">
                <QuickLink
                  title="Manage Products"
                  description="View and edit all products"
                  icon={<Package size={18} />}
                  onClick={() => navigate("/admin/products")}
                  color="blue"
                />
                <QuickLink
                  title="Featured Products"
                  description="Manage featured items"
                  icon={<Star size={18} />}
                  onClick={() => navigate("/admin/featured")}
                  color="yellow"
                />
                <QuickLink
                  title="Manage Users"
                  description="View and manage users"
                  icon={<Users size={18} />}
                  onClick={() => navigate("/admin/users")}
                  color="green"
                />
                <QuickLink
                  title="Bulk Upload"
                  description="Upload multiple images"
                  icon={<Upload size={18} />}
                  onClick={() => navigate("/admin/upload")}
                  color="purple"
                />
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-gray-600" />
                System Status
              </h2>
              <div className="space-y-3">
                <StatusItem
                  label="API Connection"
                  status="healthy"
                  icon={<CheckCircle size={16} className="text-green-600" />}
                />
                <StatusItem
                  label="Storage"
                  status="92% available"
                  icon={<AlertCircle size={16} className="text-blue-600" />}
                />
                <StatusItem
                  label="Last Backup"
                  status="2 hours ago"
                  icon={<Calendar size={16} className="text-gray-600" />}
                />
              </div>
            </div>

            {/* Recent Activity Preview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <ActivityItem
                  action="New product added"
                  item="Summer Collection"
                  time="5 min ago"
                />
                <ActivityItem
                  action="Product updated"
                  item="Running Shoes"
                  time="1 hour ago"
                />
                <ActivityItem
                  action="Featured updated"
                  item="3 items marked as featured"
                  time="3 hours ago"
                />
                <ActivityItem
                  action="New user registered"
                  item="john.doe@example.com"
                  time="5 hours ago"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

// Enhanced Stat Card Component
const StatCard = ({ title, value, icon, bgColor, trend, subtext }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
    <div className="flex items-start justify-between">
      <div className={`${bgColor} p-3 rounded-lg`}>
        {icon}
      </div>
      {trend && (
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
  </div>
);

// Simple Stat Card
const SimpleStatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-4">
    <div className="flex items-center gap-3">
      <div className={`bg-${color}-50 p-2 rounded-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

// Enhanced Quick Link Component
const QuickLink = ({ title, description, icon, onClick, color }) => {
  const colorClasses = {
    blue: "hover:bg-blue-50 hover:text-blue-600",
    yellow: "hover:bg-yellow-50 hover:text-yellow-600",
    green: "hover:bg-green-50 hover:text-green-600",
    purple: "hover:bg-purple-50 hover:text-purple-600"
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border border-gray-100 cursor-pointer transition-all hover:shadow-md ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-3">
        <div className={`text-${color}-600`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="font-medium">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <ChevronRight size={18} className="text-gray-400" />
      </div>
    </div>
  );
};

// Status Item Component
const StatusItem = ({ label, status, icon }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-600">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{status}</span>
      {icon}
    </div>
  </div>
);

// Activity Item Component
const ActivityItem = ({ action, item, time }) => (
  <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
    <div className="w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
    <div className="flex-1">
      <p className="text-sm">
        <span className="font-medium">{action}</span>
        {item && <span className="text-gray-600">: {item}</span>}
      </p>
      <p className="text-xs text-gray-500 mt-1">{time}</p>
    </div>
  </div>
);