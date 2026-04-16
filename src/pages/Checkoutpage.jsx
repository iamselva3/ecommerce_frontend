import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Trash2, Plus, Minus, ArrowLeft, Check, Home, MapPin, Building, ChevronDown } from "lucide-react";
import LogoLoader from "../components/LogoLoader";
import PincodeChecker from '../components/PincodeChecker';

const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : "";

const formatSizeForDisplay = (size, category) => {
  if (!size) return size;
  const isShoe = category?.toLowerCase() === "shoes" || category?.toLowerCase() === "shoe";
  if (isShoe) {
    const shoeSizeMap = {
      'xs': '6',
      's': '7',
      'm': '8',
      'l': '9',
      'xl': '10',
      'xxl': '11',
      'xs/s': '6/7',
      's/m': '7/8',
      'm/l': '8/9',
      'l/xl': '9/10',
      'xl/xxl': '10/11'
    };
    const normalizedSize = String(size).toLowerCase();
    return shoeSizeMap[normalizedSize] || size;
  }
  return String(size).toUpperCase();
};

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    city: "",
    state: "",
    street: "",
    landmark: "",
    addressType: "home",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [isPincodeValidated, setIsPincodeValidated] = useState(false);
  const [validatedPincodeData, setValidatedPincodeData] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null);

  const handlePincodeValidated = (pincodeData) => {
    setValidatedPincodeData(pincodeData);
    setIsPincodeValidated(true);

    if (pincodeData?.deliveryDays) {
      const today = new Date();
      const estimatedDate = new Date(today);
      estimatedDate.setDate(today.getDate() + pincodeData.deliveryDays);
      setDeliveryDate(estimatedDate);
    }
  };

  const directProduct = location.state?.directProduct;

  useEffect(() => {
    if (!user._id && !user.name) {
      navigate("/login");
      return;
    }

    fetchSavedAddresses();

    if (directProduct) {
      const singleItemCart = {
        items: [
          {
            productId: directProduct.productId,
            name: directProduct.name,
            price: directProduct.price,
            image: directProduct.image,
            qty: directProduct.qty || 1,
            sizes: directProduct.sizes,
            category: directProduct.category || "products",
          },
        ],
        isDirectBuy: true,
      };
      setCart(singleItemCart);
      setLoading(false);
    } else {
      const fetchCart = async () => {
        try {
          const res = await fetch(`${API_URL}/api/cart`, {
            credentials: "include",
          });

          if (!res.ok) throw new Error("Failed to fetch cart");

          const data = await res.json();
          const cartData = data.data || data;
          
          const initialSizes = {};
          cartData.items?.forEach((item) => {
            if (item.sizes?.length > 0) {
              initialSizes[item.productId] = item.sizes[0];
            } else {
              initialSizes[item.productId] = "M";
            }
          });
          
          setSelectedSizes(initialSizes);
          setCart(cartData);
        } catch (error) {
          console.error("Cart fetch error:", error);
          toast.error("Failed to load cart");
        } finally {
          setLoading(false);
        }
      };

      fetchCart();
    }
  }, [user._id, navigate, directProduct]);

  const fetchSavedAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await fetch(`${API_URL}/api/addresses`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const addresses = data.data || [];
        setSavedAddresses(addresses);
        
        const defaultAddress = addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
          setAddress({
            fullName: defaultAddress.name || "",
            phone: defaultAddress.phone || "",
            pincode: defaultAddress.pincode || "",
            city: defaultAddress.city || "",
            state: defaultAddress.state || "",
            street: defaultAddress.street || "",
            landmark: defaultAddress.landmark || "",
            addressType: defaultAddress.addressType || "home",
          });
          setIsPincodeValidated(false);
        }
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address._id);
    setAddress({
      fullName: address.name || "",
      phone: address.phone || "",
      pincode: address.pincode || "",
      city: address.city || "",
      state: address.state || "",
      street: address.street || "",
      landmark: address.landmark || "",
      addressType: address.addressType || "home",
    });
    setIsPincodeValidated(false);
  };

  const handleAddNewAddress = () => {
    setSelectedAddressId(null);
    setAddress({
      fullName: user.name || "",
      phone: "",
      pincode: "",
      city: "",
      state: "",
      street: "",
      landmark: "",
      addressType: "home",
    });
    setShowAddressForm(true);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (name === 'pincode') {
      setIsPincodeValidated(false);
      setValidatedPincodeData(null);
    }
  };

  const validateAddress = () => {
    const requiredFields = ["fullName", "phone", "pincode", "city", "state", "street"];
    for (const field of requiredFields) {
      if (!address[field]?.trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`);
        return false;
      }
    }
    if (address.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    if (address.pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return false;
    }
    return true;
  };

  const validateSizes = () => {
    if (!cart?.items) return false;
    return cart.items.every((item) => selectedSizes[item.productId]);
  };

  const handleQuantityChange = async (productId, newQty) => {
    if (newQty < 1) return;

    if (cart?.isDirectBuy) {
      setCart((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.productId === productId ? { ...item, qty: newQty } : item
        ),
      }));
    } else {
      try {
        const res = await fetch(`${API_URL}/api/cart`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            productId,
            qty: newQty,
          }),
        });

        if (res.ok) {
          const updatedCart = await res.json();
          setCart(updatedCart.data || updatedCart);
        }
      } catch (error) {
        toast.error("Failed to update quantity");
      }
    }
  };

  const handleRemoveItem = async (productId) => {
    if (cart?.isDirectBuy) {
      navigate("/shop");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/cart/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        const updatedCart = await res.json();
        setCart(updatedCart.data || updatedCart);
        toast.success("Item removed from cart");
      }
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;
  
    if (!validateSizes()) {
      toast.error("Please select size for all items");
      return;
    }

    if (!isPincodeValidated || !validatedPincodeData?.isDeliverable) {
      toast.error("Please check delivery availability for your pincode first");
      return;
    }

    if (paymentMethod === "cod" && !validatedPincodeData?.codAvailable) {
      toast.error("Cash on Delivery is not available at your location. Please choose another payment method.");
      return;
    }

    if (!validateSizes()) {
      toast.error("Please select size for all items");
      return;
    }

    if (paymentMethod === "cod") {
      await placeOrderCOD();
    } else if (paymentMethod === "card" || paymentMethod === "upi") {
      navigateToPaymentPage();
    }
  };

  const placeOrderCOD = async () => {
    try {
      const orderData = {
        items: cart.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.qty,
          size: selectedSizes[item.productId] || null,
          color: null,
          image: item.image,
        })),
        
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: 'India',
          landmark: address.landmark || '',
        },
        
        paymentMethod: paymentMethod,

        deliveryInfo: {
          estimatedDays: validatedPincodeData?.deliveryDays,
          estimatedDate: deliveryDate,
          codAvailable: validatedPincodeData?.codAvailable,
        },
        
        isDirectBuy: cart?.isDirectBuy || false,
        notes: '',
        discount: 0,
      };

      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "Failed to place order");
      }

      if (!cart?.isDirectBuy) {
        await fetch(`${API_URL}/api/cart/clear`, {
          method: "DELETE",
          credentials: "include",
        });
      }

      toast.success("Order placed successfully!");
      
      navigate("/order-confirmation", {
        state: {
          orderId: responseData.data?.orderId || responseData.orderId,
          total: responseData.data?.totalAmount || 0,
          paymentMethod: "cod",
          deliveryDate: deliveryDate,
          deliveryDays: validatedPincodeData?.deliveryDays,
        },
      });
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error.message || "Failed to place order. Please try again.");
    }
  };

  const navigateToPaymentPage = () => {
    const paymentOrderData = {
      items: cart.items,
      selectedSizes,
      address,
      paymentMethod,
      subtotal: calculateSubtotal(),
      gst: calculateGST(),
      delivery: calculateDelivery(),
      total: calculateTotal(),
      isDirectBuy: cart?.isDirectBuy || false,
      deliveryInfo: {
        estimatedDays: validatedPincodeData?.deliveryDays,
        estimatedDate: deliveryDate,
        codAvailable: validatedPincodeData?.codAvailable,
      },
    };

    navigate("/payment", {
      state: {
        orderData: paymentOrderData,
      },
    });
  };

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const calculateGST = () => {
    return Math.round(calculateSubtotal() * 0.18);
  };

  const calculateDelivery = () => {
    return calculateSubtotal() > 1000 ? 0 : 50;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateGST() + calculateDelivery();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LogoLoader />
        </div>
      </div>
    );
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-8">
            Add some amazing products to your cart and come back here!
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/shop")}
              className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
            >
              Browse Products
            </button>
            <button
              onClick={() => navigate("/")}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to {cart?.isDirectBuy ? "Shop" : "Cart"}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Checkout {cart?.isDirectBuy && "(Direct Buy)"}
          </h1>
          <p className="text-gray-600 mt-2">
            Complete your order with secure checkout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Items ({cart.items.length})
              </h2>
              
              <div className="space-y-6">
                {cart.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 pb-6 border-b last:border-0 last:pb-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Category: {item.category || "General"}
                          </p>
                        </div>
                        
                        {!cart?.isDirectBuy && (
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      <div className="mt-2">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{item.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          x {item.qty}
                        </span>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Select Size:
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {(item.sizes || ["S", "M", "L", "XL"]).map(
                            (size) => (
                              <button
                                key={size}
                                onClick={() =>
                                  setSelectedSizes((prev) => ({
                                    ...prev,
                                    [item.productId]: size,
                                  }))
                                }
                                className={`px-4 py-2 text-sm border rounded-lg uppercase transition-all
                                  ${
                                    selectedSizes[item.productId] === size
                                      ? "bg-black text-white border-black"
                                      : "border-gray-300 hover:border-gray-400"
                                  }
                                `}
                              >
                                {formatSizeForDisplay(size, item.category)}
                                {selectedSizes[item.productId] === size && (
                                  <Check size={12} className="inline ml-1" />
                                )}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.productId, item.qty - 1)
                            }
                            className="px-3 py-2 hover:bg-gray-100"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-2">{item.qty}</span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.productId, item.qty + 1)
                            }
                            className="px-3 py-2 hover:bg-gray-100"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <div className="text-gray-600">
                          Total: <span className="font-bold">₹{(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Shipping Address
                </h2>
                {!showAddressForm && savedAddresses.length > 0 && (
                  <button
                    onClick={handleAddNewAddress}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add New Address
                  </button>
                )}
              </div>

              {loadingAddresses ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {!showAddressForm && savedAddresses.length > 0 && (
                    <div className="mb-6 space-y-3">
                      {savedAddresses.map((savedAddr) => (
                        <div
                          key={savedAddr._id}
                          onClick={() => handleSelectAddress(savedAddr)}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedAddressId === savedAddr._id
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                savedAddr.addressType === "home" ? "bg-green-100" : "bg-purple-100"
                              }`}>
                                {savedAddr.addressType === "home" ? (
                                  <Home size={20} className="text-green-600" />
                                ) : (
                                  <Building size={20} className="text-purple-600" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{savedAddr.name}</span>
                                  {savedAddr.isDefault && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {savedAddr.street}, {savedAddr.city}, {savedAddr.state} - {savedAddr.pincode}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Phone: {savedAddr.phone}</p>
                              </div>
                            </div>
                            {selectedAddressId === savedAddr._id && (
                              <Check size={20} className="text-blue-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(showAddressForm || savedAddresses.length === 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={address.fullName}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={address.phone}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="10-digit mobile number"
                          maxLength="10"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={address.pincode}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="6-digit pincode"
                          maxLength="6"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={address.city}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter city"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={address.state}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter state"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Type
                        </label>
                        <select
                          name="addressType"
                          value={address.addressType}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                        </select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address *
                        </label>
                        <textarea
                          name="street"
                          value={address.street}
                          onChange={handleAddressChange}
                          rows="2"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="House no., Building, Street, Area"
                          required
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          name="landmark"
                          value={address.landmark}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nearby landmark"
                        />
                      </div>

                      {savedAddresses.length > 0 && (
                        <div className="md:col-span-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddressForm(false);
                              const defaultAddr = savedAddresses.find(addr => addr.isDefault);
                              if (defaultAddr) {
                                handleSelectAddress(defaultAddr);
                              }
                            }}
                            className="text-sm text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mt-8">
              <PincodeChecker
                onPincodeValidated={handlePincodeValidated}
                selectedPincode={address.pincode}
                onPincodeChange={(newPincode) => {
                  setAddress(prev => ({ ...prev, pincode: newPincode }));
                }}
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Payment Method
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-5 w-5 text-blue-600"
                  />
                  <div className="ml-3">
                    <span className="font-medium">Cash on Delivery</span>
                    <p className="text-sm text-gray-500 mt-1">
                      Pay when you receive your order
                    </p>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-5 w-5 text-blue-600"
                  />
                  <div className="ml-3">
                    <span className="font-medium">Credit/Debit Card</span>
                    <p className="text-sm text-gray-500 mt-1">
                      Pay securely with your card
                    </p>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === "upi"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-5 w-5 text-blue-600"
                  />
                  <div className="ml-3">
                    <span className="font-medium">UPI</span>
                    <p className="text-sm text-gray-500 mt-1">
                      Pay using any UPI app
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{calculateSubtotal().toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-medium">₹{calculateGST().toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium">
                      {calculateDelivery() === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${calculateDelivery()}`
                      )}
                    </span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <span>₹{calculateTotal().toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Inclusive of all taxes
                    </p>
                  </div>
                  
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!validateSizes()}
                    className={`w-full py-4 rounded-lg font-bold text-white transition-all mt-6
                      ${
                        validateSizes() 
                          ? "bg-black hover:bg-gray-800 active:scale-[0.98]"
                          : "bg-gray-300 cursor-not-allowed"
                      }
                    `}
                  >
                    { !validateSizes() ? (
                      "Select Sizes First"
                    ) : paymentMethod === "cod" ? (
                      "Place Order (Cash on Delivery)"
                    ) : (
                      "Proceed to Payment"
                    )}
                  </button>
                  
                  <p className="text-xs text-center text-gray-500 mt-4">
                    By placing your order, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-blue-600 mr-3">🔒</div>
                  <div>
                    <p className="font-medium text-blue-900">Secure Checkout</p>
                    <p className="text-sm text-blue-700">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;  
