import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  User, Mail, Phone, MapPin, Shield, Edit2, Save, X,
  ShoppingBag, Heart, Package, Settings, LogOut, Bell,
  CreditCard, Calendar, Truck, Star, Camera, Check,
  Home, Briefcase, Smartphone, Plus, ChevronRight, Menu
} from "lucide-react";
import LogoLoader from "../components/LogoLoader";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
  }, [token, navigate]);

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

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch(`${API_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setWishlist(data.data?.items || []);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      }
    };

    if (token) fetchWishlist();
  }, [token]);

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
      setAddresses(data.data || []);
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
      setPaymentMethods(data.data || []);
    } catch (err) {
      console.error("Failed to fetch payment methods:", err);
    }
  };

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
      
      if (formData.address?.street && formData.address?.city && formData.address?.state && formData.address?.pincode) {
        const addressPayload = {
          name: formData.name,
          phone: formData.phone,
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          pincode: formData.address.pincode,
          country: formData.address.country || "India",
          addressType: "home",
          isDefault: addresses.length === 0
        };
        
        if (addresses.length === 0) {
          await fetch(`${API_URL}/api/addresses`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(addressPayload),
          });
          fetchAddresses();
        } else {
          const defaultAddress = addresses.find(addr => addr.isDefault);
          if (defaultAddress) {
            await fetch(`${API_URL}/api/addresses/${defaultAddress._id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(addressPayload),
            });
            fetchAddresses();
          }
        }
      }
      
      setIsEditing(false);
      toast.success("🎉 Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async () => {
    try {
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
    toast.info("Logged out successfully");
  };

  const stats = [
    { icon: ShoppingBag, label: "Orders", value: orders.length, color: "bg-blue-500" },
    { icon: Heart, label: "Wishlist", value: wishlist.length, color: "bg-pink-500" },
    { icon: MapPin, label: "Addresses", value: addresses.length, color: "bg-green-500" },
    { icon: CreditCard, label: "Payments", value: paymentMethods.length, color: "bg-purple-500" },
  ];

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "My Orders", icon: ShoppingBag },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "address", label: "Addresses", icon: MapPin },
    { id: "payments", label: "Payment Methods", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <LogoLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
              
              <div className="flex items-center gap-4 flex-1 md:flex-none">
                <div className="relative">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User size={32} className="md:size-40" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white p-1.5 md:p-2 rounded-full shadow-lg hover:bg-gray-100">
                    <Camera size={14} className="md:size-16 text-gray-700" />
                  </button>
                </div>
                
                <div className="flex-1">
                  <h1 className="text-xl md:text-2xl font-bold">{user?.name}</h1>
                  <p className="text-sm md:text-base text-blue-100 truncate">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield size={14} />
                    <span className="text-xs md:text-sm capitalize">{user?.role} Account</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 md:px-6 py-2 md:py-3 rounded-lg transition-all duration-300 w-full md:w-auto justify-center"
            >
              <LogOut size={18} />
              <span className="md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 md:-mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 mt-3 md:mt-5">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-3 md:p-6 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center gap-2 md:gap-4">
                <div className={`${stat.color} p-2 md:p-3 rounded-lg`}>
                  <stat.icon size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs md:text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        <div className={`fixed left-0 top-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Menu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                <X size={20} />
              </button>
            </div>
          </div>
          <nav className="p-4 overflow-y-auto h-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-6">
              <nav className="p-4">
                {tabs.map((tab) => (
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

          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Personal Information</h2>
                    <p className="text-sm md:text-base text-gray-600">Update your personal details here</p>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-blue-700 w-full md:w-auto justify-center"
                    >
                      <Edit2 size={18} />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                      <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
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
                        className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-gray-50"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <User size={16} />
                        Full Name
                      </label>
                      {!isEditing ? (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm md:text-base">{user?.name}</p>
                      ) : (
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your full name"
                        />
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Mail size={16} />
                        Email Address
                      </label>
                      {!isEditing ? (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm md:text-base break-all">{user?.email}</p>
                      ) : (
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your email"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} />
                      Phone Number
                    </label>
                    {!isEditing ? (
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm md:text-base">{user?.phone || "Not provided"}</p>
                    ) : (
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your phone number"
                      />
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} />
                      Address
                    </label>
                    {!isEditing ? (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm md:text-base">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleChange}
                          className="col-span-1 md:col-span-2 border border-gray-300 rounded-lg px-4 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Street address"
                        />
                        <input
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleChange}
                          className="border border-gray-300 rounded-lg px-4 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="City"
                        />
                        <input
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleChange}
                          className="border border-gray-300 rounded-lg px-4 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="State"
                        />
                        <input
                          name="address.pincode"
                          value={formData.address.pincode}
                          onChange={handleChange}
                          className="border border-gray-300 rounded-lg px-4 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Pincode"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">My Orders</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-8 md:py-12">
                    <ShoppingBag size={40} className="md:size-48 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-sm md:text-base text-gray-600 mb-4">Start shopping to see your orders here</p>
                    <button
                      onClick={() => navigate("/shop")}
                      className="bg-black text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-gray-800 text-sm md:text-base"
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="border rounded-xl p-3 md:p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0 mb-3 md:mb-4">
                          <div>
                            <p className="font-semibold text-sm md:text-base">Order {order.orderId || order._id.slice(-8)}</p>
                            <p className="text-xs md:text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium self-start md:self-auto ${
                            order.orderStatus === "delivered" ? "bg-green-100 text-green-800" :
                            order.orderStatus === "shipped" ? "bg-blue-100 text-blue-800" :
                            order.orderStatus === "processing" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0">
                          <div className="flex items-center gap-2">
                            <Package size={16} className="md:size-18 text-gray-500" />
                            <span className="text-xs md:text-sm text-gray-600">{order.items?.length || 0} items</span>
                          </div>
                          <div className="text-base md:text-lg font-bold">₹{order.totalAmount?.toLocaleString()}</div>
                        </div>
                        <button 
                          onClick={() => navigate(`/track-order/${order._id}`)}
                          className="w-full mt-3 md:mt-4 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm md:text-base"
                        >
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">My Wishlist ({wishlist.length})</h2>
                {wishlist.length === 0 ? (
                  <div className="text-center py-8 md:py-12">
                    <Heart size={40} className="md:size-48 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-sm md:text-base text-gray-600 mb-4">Save your favorite items here</p>
                    <button
                      onClick={() => navigate("/shop")}
                      className="bg-black text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-gray-800 text-sm md:text-base"
                    >
                      Explore Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {wishlist.map((item) => {
                      const product = item.product || {};
                      const imageUrl = product.images?.[0]?.url || "https://via.placeholder.com/300x300";
                      
                      return (
                        <div key={item._id} className="border rounded-xl overflow-hidden hover:shadow-lg transition-all">
                          <img
                            src={imageUrl}
                            alt={product.name || "Product"}
                            className="w-full h-40 md:h-48 object-cover"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/300x300";
                            }}
                          />
                          <div className="p-3 md:p-4">
                            <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{product.name || "Unnamed Product"}</h3>
                            <p className="text-base md:text-lg font-bold text-gray-900 mt-1 md:mt-2">
                              ₹{product.price?.toLocaleString() || "0"}
                            </p>
                            <div className="flex gap-2 mt-3 md:mt-4">
                              <button className="flex-1 bg-black text-white py-1.5 md:py-2 rounded-lg hover:bg-gray-800 text-sm md:text-base">
                                Add to Cart
                              </button>
                              <button className="p-1.5 md:p-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:text-red-600">
                                <Heart size={16} className="md:size-18 fill-current" />
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

            {activeTab === "address" && (
              <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">My Addresses</h2>
                    <p className="text-sm md:text-base text-gray-600">Manage your saved addresses</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingAddress(null);
                      resetAddressForm();
                      setShowAddressModal(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 w-full md:w-auto text-sm md:text-base"
                  >
                    <Plus size={18} />
                    Add New Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-8 md:py-12">
                    <MapPin size={40} className="md:size-48 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No addresses saved</h3>
                    <p className="text-sm md:text-base text-gray-600 mb-4">Add your first address to make checkout faster</p>
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
                            {address.addressType === 'home' ? <Home size={16} /> :
                             address.addressType === 'work' ? <Briefcase size={16} /> : <MapPin size={16} />}
                          </div>
                          <div>
                            <p className="font-semibold text-sm md:text-base">{address.name}</p>
                            <p className="text-xs md:text-sm text-gray-600">{address.phone}</p>
                          </div>
                        </div>

                        <div className="text-xs md:text-sm text-gray-600 mb-4">
                          <p>{address.street}</p>
                          <p>{address.city}, {address.state} - {address.pincode}</p>
                          <p>{address.country}</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {!address.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(address._id)}
                              className="text-xs md:text-sm text-blue-600 hover:text-blue-700"
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
                            className="text-xs md:text-sm text-green-600 hover:text-green-700 ml-auto"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address._id)}
                            className="text-xs md:text-sm text-red-600 hover:text-red-700"
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

            {activeTab === "payments" && (
              <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Payment Methods</h2>
                    <p className="text-sm md:text-base text-gray-600">Manage your saved payment methods</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingPayment(null);
                      resetPaymentForm();
                      setShowPaymentModal(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 w-full md:w-auto text-sm md:text-base"
                  >
                    <Plus size={18} />
                    Add Payment Method
                  </button>
                </div>

                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8 md:py-12">
                    <CreditCard size={40} className="md:size-48 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No payment methods saved</h3>
                    <p className="text-sm md:text-base text-gray-600 mb-4">Add a payment method for faster checkout</p>
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

                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                          {method.type === 'card' && (
                            <>
                              <div className="p-3 bg-gray-100 rounded-lg">
                                <CreditCard size={20} className="md:size-24" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm md:text-base">
                                  {method.cardDetails?.brand?.toUpperCase()} •••• {method.cardDetails?.last4}
                                </p>
                                <p className="text-xs md:text-sm text-gray-600">
                                  Expires {method.cardDetails?.expiryMonth}/{method.cardDetails?.expiryYear}
                                </p>
                                <p className="text-xs text-gray-500">{method.cardDetails?.cardHolderName}</p>
                              </div>
                            </>
                          )}

                          {method.type === 'upi' && (
                            <>
                              <div className="p-3 bg-gray-100 rounded-lg">
                                <Smartphone size={20} className="md:size-24" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm md:text-base">UPI ID</p>
                                <p className="text-xs md:text-sm text-gray-600 break-all">{method.upiDetails?.upiId}</p>
                              </div>
                            </>
                          )}

                          <div className="flex gap-3 md:ml-auto">
                            {!method.isDefault && (
                              <button
                                onClick={() => handleSetDefaultPayment(method._id)}
                                className="text-xs md:text-sm text-blue-600 hover:text-blue-700"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={() => handleDeletePaymentMethod(method._id)}
                              className="text-xs md:text-sm text-red-600 hover:text-red-700"
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

            {activeTab === "notifications" && (
              <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Notifications</h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Bell size={16} className="md:size-18 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm md:text-base">Order #{i} has been shipped</p>
                        <p className="text-xs md:text-sm text-gray-600">Your order is on the way and will arrive soon.</p>
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

            {activeTab === "settings" && (
              <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Account Settings</h2>
                <div className="space-y-4 md:space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-3">
                    <div>
                      <p className="font-medium text-sm md:text-base">Email Notifications</p>
                      <p className="text-xs md:text-sm text-gray-600">Receive updates about your orders</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer self-start md:self-auto">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-3">
                    <div>
                      <p className="font-medium text-sm md:text-base">SMS Notifications</p>
                      <p className="text-xs md:text-sm text-gray-600">Get text messages for order updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer self-start md:self-auto">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-3">
                    <div>
                      <p className="font-medium text-sm md:text-base">Marketing Emails</p>
                      <p className="text-xs md:text-sm text-gray-600">Receive offers and promotions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer self-start md:self-auto">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="pt-4">
                    <button className="text-red-600 hover:text-red-700 font-medium text-sm md:text-base">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

            {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddressModal(false);
                    setEditingAddress(null);
                    resetAddressForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Street Address *
                  </label>
                  <textarea
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                    placeholder="House number, building, street, area"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="State"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="6-digit pincode"
                      maxLength="6"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Country
                    </label>
                    <input
                      type="text"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Country"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address Type
                  </label>
                  <div className="relative">
                    <select
                      value={addressForm.addressType}
                      onChange={(e) => setAddressForm({...addressForm, addressType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white"
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
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
                    className="flex-1 border border-gray-300 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                    className="flex-1 bg-black text-white py-3 rounded-xl hover:bg-gray-800 text-sm font-medium transition-colors"
                  >
                    {editingAddress ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}    

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg md:text-xl font-bold">
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
                  <X size={20} className="md:size-24" />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefaultPayment"
                    checked={paymentForm.isDefault}
                    onChange={(e) => setPaymentForm({...paymentForm, isDefault: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
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
                    className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPaymentMethod}
                    className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 text-sm font-medium"
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