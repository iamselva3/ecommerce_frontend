import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Trash2, Plus, Minus, ArrowLeft, Check } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    city: "",
    state: "",
    street: "",
    landmark: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Check if this is direct buy (not from cart)
  const directProduct = location.state?.directProduct;

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (directProduct) {
      // Handle direct buy - create a single-item cart
      const singleItemCart = {
        items: [
          {
            productId: directProduct.productId,
            name: directProduct.name,
            price: directProduct.price,
            image: directProduct.image,
            qty: directProduct.qty || 1,
            sizes: ["S", "M", "L", "XL"],
            category: "products",
            availableSizes: ["S", "M", "L", "XL"],
          },
        ],
        isDirectBuy: true,
      };
      setCart(singleItemCart);
      setLoading(false);
    } else {
      // Normal cart checkout - fetch from API
      const fetchCart = async () => {
        try {
          const res = await fetch(`${API_URL}/api/cart`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) throw new Error("Failed to fetch cart");

          const data = await res.json();
          const cartData = data.data || data;
          
          // Initialize selected sizes for each item
          const initialSizes = {};
          cartData.items?.forEach((item) => {
            if (item.availableSizes?.length > 0) {
              initialSizes[item.productId] = item.availableSizes[0];
            } else {
              initialSizes[item.productId] = "M"; // Default size
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
  }, [token, navigate, directProduct]);

  // Handle quantity change
  const handleQuantityChange = async (productId, newQty) => {
    if (newQty < 1) return;

    if (cart?.isDirectBuy) {
      // Update quantity for direct buy
      setCart((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.productId === productId ? { ...item, qty: newQty } : item
        ),
      }));
    } else {
      // Update quantity via API
      try {
        const res = await fetch(`${API_URL}/api/cart`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId,
            qty: newQty,
          }),
        });

        if (res.ok) {
          const updatedCart = await res.json();
          setCart(updatedCart.data || updatedCart);
          // toast.success("Quantity updated");
        }
      } catch (error) {
        toast.error("Failed to update quantity");
      }
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (productId) => {
    if (cart?.isDirectBuy) {
      navigate("/shop"); // Go back to shop if removing from direct buy
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/cart/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  // Handle address change
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate address
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

  // Validate all items have size selected
  const validateSizes = () => {
    if (!cart?.items) return false;
    
    return cart.items.every((item) => selectedSizes[item.productId]);
  };

  // Place order
const handlePlaceOrder = async () => {
  if (!validateAddress()) return;
  
  if (!validateSizes()) {
    toast.error("Please select size for all items");
    return;
  }

  // For COD - place order directly
  if (paymentMethod === "cod") {
    await placeOrderCOD();
  } 
  // For Card/UPI - redirect to payment page
  else if (paymentMethod === "card" || paymentMethod === "upi") {
    navigateToPaymentPage();
  }
};

// Function to place COD order
const placeOrderCOD = async () => {
  try {
    const orderData = {
      items: cart.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.qty,
        size: selectedSizes[item.productId] || null,
        color: null, // Change from "no" to null
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
      
      isDirectBuy: cart?.isDirectBuy || false,
      notes: '',
      discount: 0,
    };

    console.log("Sending order data:", JSON.stringify(orderData, null, 2));

    const res = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    const responseData = await res.json();
    console.log("Order response:", responseData);

    if (!res.ok) {
      throw new Error(responseData.message || "Failed to place order");
    }

    // Clear cart if not direct buy
    if (!cart?.isDirectBuy) {
      await fetch(`${API_URL}/api/cart/clear`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    toast.success("🎉 Order placed successfully!");
    
    navigate("/order-confirmation", {
      state: {
        orderId: responseData.data?.orderId || responseData.orderId,
        total: responseData.data?.totalAmount || 0,
        paymentMethod: "cod",
      },
    });
  } catch (error) {
    console.error("Order error:", error);
    toast.error(error.message || "Failed to place order. Please try again.");
  }
};

// Function to navigate to payment page
const navigateToPaymentPage = () => {
  // Prepare order data to pass to payment page
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
  };

  // Navigate to appropriate payment page
  navigate("/payment", {
    state: {
      orderData: paymentOrderData,
    },
  });
};

  // Calculate totals
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
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
        {/* Header */}
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
          {/* Left Column - Items & Address */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
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
                    {/* Product Image */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />

                    {/* Product Details */}
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

                      {/* Price */}
                      <div className="mt-2">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{item.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          x {item.qty}
                        </span>
                      </div>

                      {/* Size Selection */}
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Select Size:
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {(item.availableSizes || ["S", "M", "L", "XL"]).map(
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
                                {size}
                                {selectedSizes[item.productId] === size && (
                                  <Check size={12} className="inline ml-1" />
                                )}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
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

            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Shipping Address
              </h2>
              
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
              </div>
            </div>

            {/* Payment Method */}
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

          {/* Right Column - Order Summary */}
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
                    {validateSizes() ? (
                      paymentMethod === "cod" ? (
                        "Place Order (Cash on Delivery)"
                      ) : (
                        "Proceed to Payment"
                      )
                    ) : (
                      "Select Sizes First"
                    )}
                  </button>
                  
                  <p className="text-xs text-center text-gray-500 mt-4">
                    By placing your order, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
              
              {/* Secure Checkout Badge */}
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