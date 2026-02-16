import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  User, Mail, Phone, MapPin, Shield, Edit2, Save, X,
  ShoppingBag, Heart, Package, Settings, LogOut, Bell,
  CreditCard, Calendar, Truck, Star, Camera, Check,
  Home, Briefcase, Smartphone, Plus, ChevronRight
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
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  
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

  // Address form state
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    addressType: "home",
    isDefault: false
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    type: "card",
    cardDetails: {
      last4: "",
      brand: "",
      expiryMonth: "",
      expiryYear: "",
      cardHolderName: ""
    },
    upiDetails: {
      upiId: ""
    },
    isDefault: false
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

      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProfile();
  }, [token]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setOrders(data.data.orders || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };

    if (token) fetchOrders();
  }, [token]);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch(`${API_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        // setWishlist(data.data || []);
          setWishlist(data.data?.items || []);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      }
    };

    if (token) fetchWishlist();
  }, [token]);

  // Fetch addresses and payment methods
  useEffect(() => {
    if (token) {
      fetchAddresses();
      fetchPaymentMethods();
    }
  }, [token]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payment-methods`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPaymentMethods(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch payment methods:", err);
    }
  };

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

  // Address handlers
  const handleAddAddress = async () => {
    try {
        console.log("Address form data being sent:", addressForm);
      const res = await fetch(`${API_URL}/api/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(addressForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Address added successfully");
        setShowAddressModal(false);
        fetchAddresses();
        resetAddressForm();
      }
    } catch (err) {
      toast.error("Failed to add address");
    }
  };

  const handleUpdateAddress = async () => {
    try {
      const res = await fetch(`${API_URL}/api/addresses/${editingAddress._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(addressForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Address updated successfully");
        setShowAddressModal(false);
        setEditingAddress(null);
        fetchAddresses();
        resetAddressForm();
      }
    } catch (err) {
      toast.error("Failed to update address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    
    try {
      const res = await fetch(`${API_URL}/api/addresses/${addressId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Address deleted successfully");
        fetchAddresses();
      }
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const res = await fetch(`${API_URL}/api/addresses/${addressId}/default`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Default address updated");
        fetchAddresses();
      }
    } catch (err) {
      toast.error("Failed to set default address");
    }
  };

  // Payment method handlers
  const handleAddPaymentMethod = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payment-methods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(paymentForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payment method added successfully");
        setShowPaymentModal(false);
        fetchPaymentMethods();
        resetPaymentForm();
      }
    } catch (err) {
      toast.error("Failed to add payment method");
    }
  };

  const handleDeletePaymentMethod = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment method?")) return;
    
    try {
      const res = await fetch(`${API_URL}/api/payment-methods/${paymentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payment method deleted successfully");
        fetchPaymentMethods();
      }
    } catch (err) {
      toast.error("Failed to delete payment method");
    }
  };

  const handleSetDefaultPayment = async (paymentId) => {
    try {
      const res = await fetch(`${API_URL}/api/payment-methods/${paymentId}/default`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Default payment method updated");
        fetchPaymentMethods();
      }
    } catch (err) {
      toast.error("Failed to set default payment method");
    }
  };

  // Reset forms
  const resetAddressForm = () => {
    setAddressForm({
      name: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      addressType: "home",
      isDefault: false
    });
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      type: "card",
      cardDetails: {
        last4: "",
        brand: "",
        expiryMonth: "",
        expiryYear: "",
        cardHolderName: ""
      },
      upiDetails: {
        upiId: ""
      },
      isDefault: false
    });
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
    { icon: MapPin, label: "Addresses", value: addresses.length, color: "bg-green-500" },
    { icon: CreditCard, label: "Payments", value: paymentMethods.length, color: "bg-purple-500" },
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-5">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
                    <button
                      onClick={() => navigate("/shop")}
                      className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-semibold">Order {order.orderId || order._id.slice(-8)}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.orderStatus === "delivered" ? "bg-green-100 text-green-800" :
                            order.orderStatus === "shipped" ? "bg-blue-100 text-blue-800" :
                            order.orderStatus === "processing" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Package size={18} className="text-gray-500" />
                            <span className="text-gray-600">{order.items?.length || 0} items</span>
                          </div>
                          <div className="text-lg font-bold">₹{order.totalAmount?.toLocaleString()}</div>
                        </div>
                       <button 
   onClick={() => navigate(`/track-order/${order.orderId.replace('#', '')}`)}
  className="w-full mt-4 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
>
  View Details
</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist ({wishlist.length})</h2>
               {wishlist.length === 0 ? (
  <div className="text-center py-12">
    <Heart size={48} className="mx-auto text-gray-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
    <p className="text-gray-600 mb-4">Save your favorite items here</p>
    <button
      onClick={() => navigate("/shop")}
      className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
    >
      Explore Products
    </button>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {wishlist.map((item) => {
      // Extract product details from the nested structure
      const product = item.product || {};
      const imageUrl = product.images?.[0]?.url || "https://via.placeholder.com/300x300";
      
      return (
        <div key={item._id} className="border rounded-xl overflow-hidden hover:shadow-lg transition-all">
          <img
            src={imageUrl}
            alt={product.name || "Product"}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300x300";
            }}
          />
          <div className="p-4">
            <h3 className="font-semibold text-gray-900">{product.name || "Unnamed Product"}</h3>
            <p className="text-lg font-bold text-gray-900 mt-2">
              ₹{product.price?.toLocaleString() || "0"}
            </p>
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
      );
    })}
  </div>
)}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "address" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Addresses</h2>
                    <p className="text-gray-600">Manage your saved addresses</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingAddress(null);
                      resetAddressForm();
                      setShowAddressModal(true);
                    }}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                  >
                    <Plus size={18} />
                    Add New Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses saved</h3>
                    <p className="text-gray-600 mb-4">Add your first address to make checkout faster</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className={`border rounded-xl p-4 relative ${
                          address.isDefault ? 'border-blue-500 bg-blue-50' : 'hover:shadow-md'
                        }`}
                      >
                        {address.isDefault && (
                          <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                        
                        <div className="flex items-start gap-2 mb-3">
                          <div className={`p-2 rounded-lg ${
                            address.addressType === 'home' ? 'bg-green-100' :
                            address.addressType === 'work' ? 'bg-purple-100' : 'bg-gray-100'
                          }`}>
                            {address.addressType === 'home' ? <Home size={18} /> :
                             address.addressType === 'work' ? <Briefcase size={18} /> : <MapPin size={18} />}
                          </div>
                          <div>
                            <p className="font-semibold">{address.name}</p>
                            <p className="text-sm text-gray-600">{address.phone}</p>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-4">
                          <p>{address.street}</p>
                          <p>{address.city}, {address.state} - {address.pincode}</p>
                          <p>{address.country}</p>
                        </div>

                        <div className="flex gap-2">
                          {!address.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(address._id)}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              Set as Default
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingAddress(address);
                              setAddressForm({
                                name: address.name,
                                phone: address.phone,
                                street: address.street,
                                city: address.city,
                                state: address.state,
                                pincode: address.pincode,
                                country: address.country,
                                addressType: address.addressType,
                                isDefault: address.isDefault
                              });
                              setShowAddressModal(true);
                            }}
                            className="text-sm text-green-600 hover:text-green-700 ml-auto"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address._id)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === "payments" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
                    <p className="text-gray-600">Manage your saved payment methods</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingPayment(null);
                      resetPaymentForm();
                      setShowPaymentModal(true);
                    }}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                  >
                    <Plus size={18} />
                    Add Payment Method
                  </button>
                </div>

                {paymentMethods.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment methods saved</h3>
                    <p className="text-gray-600 mb-4">Add a payment method for faster checkout</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method._id}
                        className={`border rounded-xl p-4 relative ${
                          method.isDefault ? 'border-blue-500 bg-blue-50' : 'hover:shadow-md'
                        }`}
                      >
                        {method.isDefault && (
                          <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}

                        <div className="flex items-center gap-4">
                          {method.type === 'card' && (
                            <>
                              <div className="p-3 bg-gray-100 rounded-lg">
                                <CreditCard size={24} />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold">
                                  {method.cardDetails?.brand?.toUpperCase()} •••• {method.cardDetails?.last4}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Expires {method.cardDetails?.expiryMonth}/{method.cardDetails?.expiryYear}
                                </p>
                                <p className="text-xs text-gray-500">{method.cardDetails?.cardHolderName}</p>
                              </div>
                            </>
                          )}

                          {method.type === 'upi' && (
                            <>
                              <div className="p-3 bg-gray-100 rounded-lg">
                                <Smartphone size={24} />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold">UPI ID</p>
                                <p className="text-sm text-gray-600">{method.upiDetails?.upiId}</p>
                              </div>
                            </>
                          )}

                          <div className="flex gap-2">
                            {!method.isDefault && (
                              <button
                                onClick={() => handleSetDefaultPayment(method._id)}
                                className="text-sm text-blue-600 hover:text-blue-700"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={() => handleDeletePaymentMethod(method._id)}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Bell size={18} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Order #{i} has been shipped</p>
                        <p className="text-sm text-gray-600">Your order is on the way and will arrive soon.</p>
                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                      </div>
                      {i === 1 && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates about your orders</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Get text messages for order updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-gray-600">Receive offers and promotions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="pt-4">
                    <button className="text-red-600 hover:text-red-700 font-medium">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddressModal(false);
                    setEditingAddress(null);
                    resetAddressForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="House number, street name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="Pincode"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="Country"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Type
                  </label>
                  <select
                    value={addressForm.addressType}
                    onChange={(e) => setAddressForm({...addressForm, addressType: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-700">
                    Set as default address
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAddressModal(false);
                      setEditingAddress(null);
                      resetAddressForm();
                    }}
                    className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                    className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800"
                  >
                    {editingAddress ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {editingPayment ? 'Edit Payment Method' : 'Add Payment Method'}
                </h3>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setEditingPayment(null);
                    resetPaymentForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Type
                  </label>
                  <select
                    value={paymentForm.type}
                    onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="card">Credit/Debit Card</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>

                {paymentForm.type === 'card' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number (Last 4 digits)
                      </label>
                      <input
                        type="text"
                        placeholder="1234"
                        maxLength="4"
                        value={paymentForm.cardDetails.last4}
                        onChange={(e) => setPaymentForm({
                          ...paymentForm,
                          cardDetails: {...paymentForm.cardDetails, last4: e.target.value}
                        })}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Card Brand
                        </label>
                        <select
                          value={paymentForm.cardDetails.brand}
                          onChange={(e) => setPaymentForm({
                            ...paymentForm,
                            cardDetails: {...paymentForm.cardDetails, brand: e.target.value}
                          })}
                          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="visa">Visa</option>
                          <option value="mastercard">Mastercard</option>
                          <option value="amex">American Express</option>
                          <option value="rupay">RuPay</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Card Holder
                        </label>
                        <input
                          type="text"
                          value={paymentForm.cardDetails.cardHolderName}
                          onChange={(e) => setPaymentForm({
                            ...paymentForm,
                            cardDetails: {...paymentForm.cardDetails, cardHolderName: e.target.value}
                          })}
                          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          placeholder="Name on card"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Month
                        </label>
                        <input
                          type="text"
                          placeholder="MM"
                          maxLength="2"
                          value={paymentForm.cardDetails.expiryMonth}
                          onChange={(e) => setPaymentForm({
                            ...paymentForm,
                            cardDetails: {...paymentForm.cardDetails, expiryMonth: e.target.value}
                          })}
                          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Year
                        </label>
                        <input
                          type="text"
                          placeholder="YYYY"
                          maxLength="4"
                          value={paymentForm.cardDetails.expiryYear}
                          onChange={(e) => setPaymentForm({
                            ...paymentForm,
                            cardDetails: {...paymentForm.cardDetails, expiryYear: e.target.value}
                          })}
                          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {paymentForm.type === 'upi' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      placeholder="example@okhdfcbank"
                      value={paymentForm.upiDetails.upiId}
                      onChange={(e) => setPaymentForm({
                        ...paymentForm,
                        upiDetails: {upiId: e.target.value}
                      })}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefaultPayment"
                    checked={paymentForm.isDefault}
                    onChange={(e) => setPaymentForm({...paymentForm, isDefault: e.target.checked})}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="isDefaultPayment" className="text-sm text-gray-700">
                    Set as default payment method
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setEditingPayment(null);
                      resetPaymentForm();
                    }}
                    className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPaymentMethod}
                    className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;