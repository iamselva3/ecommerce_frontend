import React, { useEffect, useState } from "react";
import { Users, Image, Star, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [latestImages, setLatestImages] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

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

    const fetchLatest = async () => {
      try {
        const res = await fetch(`${API_URL}/api/images/latest/images`);
        const data = await res.json();
        setLatestImages(data.data.data || []);
      } catch {
        toast.error("Failed to load latest uploads");
      }
    };

    fetchStats();
    fetchLatest();
  }, [token, navigate]);

  if (!stats) {
    return <div className="p-10">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => navigate("/admin/upload")}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded"
        >
          <Upload size={18} /> Upload Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalImages}
          icon={<Image />}
        />
        <StatCard
          title="Featured Products"
          value={stats.featuredImages}
          icon={<Star />}
        />
        <StatCard
          title="Active Categories"
          value={stats.totalCategories}
          icon={<Image />}
        />
        <StatCard
          title="Total Uploads"
          value={stats.totalImages}
          icon={<Upload />}
        />
      </div>

      {/* Latest Uploads */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Latest Uploads</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {latestImages.map((img) => (
            <div
              key={img._id}
              className="bg-white rounded shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/admin/edit/${img._id}`)}
            >
              <img
                src={img.signedUrl || img.url}
                alt={img.name}
                className="h-32 w-full object-cover rounded-t"
              />
              <div className="p-2 text-sm truncate">{img.name}</div>
            </div>
          ))}
        </div>

        {latestImages.length === 0 && (
          <p className="text-gray-500">No recent uploads</p>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickLink
          title="Manage Products"
          onClick={() => navigate("/admin/upload")}
        />
        <QuickLink
          title="Featured Products"
          onClick={() => navigate("/admin/featured")}
        />
        <QuickLink
          title="Users"
          onClick={() => navigate("/admin/users")}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;



const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-5 rounded-xl shadow flex items-center gap-4">
    <div className="p-3 bg-gray-100 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const QuickLink = ({ title, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white p-6 rounded-xl shadow hover:shadow-lg cursor-pointer text-center font-semibold"
  >
    {title}
  </div>
);
