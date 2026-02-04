import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  User, Mail, Phone, MapPin, Shield, Edit2, Save, X,
  ShoppingBag, Heart, Package, Settings, LogOut, Bell,
  CreditCard, Calendar, Truck, Star, Camera, Check
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  
  // Editable fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India"
    },
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Auth guard
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
  }, [token, navigate]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        const profile = data.data?.user || data.data || data;
        
        setUser(profile);
        setFormData({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          address: profile.address || {
            street: "",
            city: "",
            state: "",
            pincode: "",
            country: "India"
          },
        });

        // Mock data for demo (replace with actual API calls)
        setOrders([
          { id: "ORD001", date: "2024-03-15", total: 2999, status: "Delivered", items: 2 },
          { id: "ORD002", date: "2024-03-10", total: 1599, status: "Processing", items: 1 },
          { id: "ORD003", date: "2024-03-05", total: 4599, status: "Shipped", items: 3 },
        ]);

        setWishlist([
          { id: 1, name: "Premium Cotton Shirt", price: 2499, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c" },
          { id: 2, name: "Designer Jeans", price: 3599, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246" },
          { id: 3, name: "Casual T-Shirt", price: 1299, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab" },
        ]);

      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProfile();
  }, [token]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Update profile
  const handleUpdate = async () => {
    try {
      setSaving(true);

      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      const updatedUser = data.data?.user || data.user || data;
      
      setUser(updatedUser);
      setIsEditing(false);
      toast.success("🎉 Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
    toast.info("Logged out successfully");
  };

  // Stats data
  const stats = [
    { icon: ShoppingBag, label: "Orders", value: orders.length, color: "bg-blue-500" },
    { icon: Heart, label: "Wishlist", value: wishlist.length, color: "bg-pink-500" },
    { icon: Star, label: "Reviews", value: 12, color: "bg-amber-500" },
    { icon: Calendar, label: "Member Since", value: "2023", color: "bg-purple-500" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={40} />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100">
                  <Camera size={16} className="text-gray-700" />
                </button>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold">{user?.name}</h1>
                <p className="text-blue-100">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Shield size={14} />
                  <span className="text-sm capitalize">{user?.role} Account</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition-all duration-300"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10">
        {/* Stats Cards */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-5">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center gap-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-14">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-6">
              <nav className="p-4">
                {[
                  { id: "profile", label: "Profile", icon: User },
                  { id: "orders", label: "My Orders", icon: ShoppingBag },
                  { id: "wishlist", label: "Wishlist", icon: Heart },
                  { id: "address", label: "Addresses", icon: MapPin },
                  { id: "payments", label: "Payment Methods", icon: CreditCard },
                  { id: "notifications", label: "Notifications", icon: Bell },
                  { id: "settings", label: "Settings", icon: Settings },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <tab.icon size={20} />
                    <span>{tab.label}</span>
                    {tab.id === "notifications" && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        3
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                    <p className="text-gray-600">Update your personal details here</p>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                      <Edit2 size={18} />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={18} />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user?.name || "",
                            email: user?.email || "",
                            phone: user?.phone || "",
                            address: user?.address || {
                              street: "",
                              city: "",
                              state: "",
                              pincode: "",
                              country: "India"
                            },
                          });
                        }}
                        className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Name */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <User size={16} />
                        Full Name
                      </label>
                      {!isEditing ? (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user?.name}</p>
                      ) : (
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your full name"
                        />
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Mail size={16} />
                        Email Address
                      </label>
                      {!isEditing ? (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user?.email}</p>
                      ) : (
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your email"
                        />
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} />
                      Phone Number
                    </label>
                    {!isEditing ? (
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user?.phone || "Not provided"}</p>
                    ) : (
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your phone number"
                      />
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} />
                      Address
                    </label>
                    {!isEditing ? (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        {user?.address?.street ? (
                          <>
                            <p className="text-gray-900">{user.address.street}</p>
                            <p className="text-gray-600">
                              {user.address.city}, {user.address.state} - {user.address.pincode}
                            </p>
                            <p className="text-gray-600">{user.address.country}</p>
                          </>
                        ) : (
                          <p className="text-gray-500">No address provided</p>
                        )}
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleChange}
                          className="col-span-2 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Street address"
                        />
                        <input
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleChange}
                          className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="City"
                        />
                        <input
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleChange}
                          className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="State"
                        />
                        <input
                          name="address.pincode"
                          value={formData.address.pincode}
                          onChange={handleChange}
                          className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Pincode"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-semibold">Order #{order.id}</p>
                          <p className="text-sm text-gray-600">{order.date}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === "Delivered" ? "bg-green-100 text-green-800" :
                          order.status === "Shipped" ? "bg-blue-100 text-blue-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package size={18} className="text-gray-500" />
                          <span className="text-gray-600">{order.items} items</span>
                        </div>
                        <div className="text-lg font-bold">₹{order.total}</div>
                      </div>
                      <button className="w-full mt-4 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist ({wishlist.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((item) => (
                    <div key={item.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition-all">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-lg font-bold text-gray-900 mt-2">₹{item.price}</p>
                        <div className="flex gap-2 mt-4">
                          <button className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800">
                            Add to Cart
                          </button>
                          <button className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:text-red-600">
                            <Heart size={18} className="fill-current" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other tabs can be implemented similarly */}
            {activeTab === "address" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Addresses</h2>
                <p className="text-gray-600">Coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;