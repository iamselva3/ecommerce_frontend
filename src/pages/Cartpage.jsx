import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowLeft,
  Truck, Shield, RotateCcw, Package, Heart,
  ShoppingCart, CreditCard, Tag
} from "lucide-react";
import LogoLoader from "../components/LogoLoader";

const API_URL = import.meta.env.VITE_API_URL;

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  console.log("wdyyw",cart)

  // Auth check
  useEffect(() => {
    if (!user?.name) {
      toast.info("Please login to view your cart");
      navigate("/login");
    }
  }, [navigate]);

  // Fetch cart
useEffect(() => {
  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        credentials: "include",
      });

      // Handle 404 - cart not found (after clearing)
      if (res.status === 404) {
        setCart({ items: [] }); // Set empty cart
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch cart");

      const data = await res.json();
      const cartData = data.data || data;
      
      // Ensure items array exists
      if (!cartData.items) {
        cartData.items = [];
      }
      
      setCart(cartData);
    } catch (err) {
      console.error("Cart fetch error:", err);
      // Set empty cart on error too
      setCart({ items: [] });
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  if (user?.name) fetchCart();
}, []);

  // Update quantity
  const updateQty = async (productId, qty) => {
    if (qty < 1) return;
    
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, qty }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      const updatedCart = data.data || data;
      setCart(updatedCart);
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update quantity");
    } finally {
      setUpdating(false);
    }
  };

  // Remove item
  const removeItem = async (productId) => {
    if (!window.confirm("Remove this item from cart?")) return;

    try {
      const res = await fetch(`${API_URL}/api/cart/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      const updatedCart = data.data || data;
      setCart(updatedCart);
      toast.success("Item removed from cart");
    } catch (err) {
      console.error("Remove error:", err);
      toast.error("Failed to remove item");
    }
  };

  // Move to wishlist
  const moveToWishlist = async (item) => {
    try {
      const res = await fetch(`${API_URL}/api/wishlist/${item.productId}`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        // Remove from cart
        await removeItem(item.productId);
        toast.success("Moved to wishlist");
      }
    } catch (err) {
      toast.error("Failed to move to wishlist");
    }
  };

  // Calculate totals
  const calculateSubtotal = () => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  const calculateGST = () => {
    return Math.round(calculateSubtotal() * 0.18);
  };

  const calculateDelivery = () => {
    return calculateSubtotal() > 999 ? 0 : 49;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateGST() + calculateDelivery();
  };

const handleClearCart = async () => {
  if (!window.confirm("Clear all items from cart?")) return;
  
  try {
    const response = await fetch(`${API_URL}/api/cart`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      
      // Set cart with the returned data (which should have empty items)
      setCart(data.data || { items: [] });
      toast.success("Cart cleared successfully");
    } else {
      toast.error("Failed to clear cart");
    }
  } catch (error) {
    console.error("Error clearing cart:", error);
    toast.error("Failed to clear cart");
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {/* <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div> */}
          
            <LogoLoader />
          
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={48} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/shop")}
              className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate("/")}
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
              >
                <ArrowLeft size={20} className="mr-2" />
                Continue Shopping
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Your Shopping Cart
              </h1>
              <p className="text-gray-600 mt-1">
                {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ₹{calculateTotal().toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Estimated total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Cart Items List */}
              <div className="divide-y">
                {cart.items.map((item) => (
                  <div key={item.productId} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="relative">
                        <img
                          src={item.image || item.images?.[0]?.url || item.images}
                          alt={item.name}
                          className="w-32 h-32 object-cover rounded-xl"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/128x128?text=No+Image";
                          }}
                        />
                        {item.discount && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                            -{item.discount}%
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg hover:text-blue-600 cursor-pointer"
                                onClick={() => navigate(`/product/${item.productId}`)}>
                              {item.name}
                            </h3>
                            
                            {/* Size & Color */}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              {item.size && (
                                <div>
                                  <span className="font-medium">Size: </span>
                                  <span className="uppercase">{item.size}</span>
                                </div>
                              )}
                              {item.color && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Color: </span>
                                  <div
                                    className="w-4 h-4 rounded-full border"
                                    style={{ backgroundColor: item.color }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Price */}
                            <div className="mt-3">
                              <div className="flex items-center gap-3">
                                <span className="text-xl font-bold text-gray-900">
                                  ₹{item.price?.toLocaleString()}
                                </span>
                                {item.originalPrice && (
                                  <span className="text-gray-500 line-through">
                                    ₹{item.originalPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col items-end gap-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center border rounded-lg">
                              <button
                                onClick={() => updateQty(item.productId, item.qty - 1)}
                                disabled={updating || item.qty <= 1}
                                className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="px-4 py-2 font-medium min-w-[40px] text-center">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => updateQty(item.productId, item.qty + 1)}
                                disabled={updating}
                                className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            {/* Remove & Wishlist */}
                            <div className="flex gap-3">
                              <button
                                onClick={() => moveToWishlist(item)}
                                className="text-gray-600 hover:text-red-600 flex items-center gap-1 text-sm"
                              >
                                <Heart size={16} />
                                <span>Wishlist</span>
                              </button>
                              <button
                                onClick={() => removeItem(item.productId)}
                                className="text-gray-600 hover:text-red-600 flex items-center gap-1 text-sm"
                              >
                                <Trash2 size={16} />
                                <span>Remove</span>
                              </button>
                            </div>

                            {/* Item Total */}
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                ₹{(item.price * item.qty).toLocaleString()}
                              </div>
                              <p className="text-sm text-gray-600">
                                {item.qty} × ₹{item.price}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Actions */}
              <div className="p-6 bg-gray-50 border-t">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => navigate("/shop")}
                      className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
                    >
                      Continue Shopping
                    </button>
                    <button
                      onClick={handleClearCart}
                      className="border border-red-300 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50"
                    >
                      Clear Cart
                    </button>
                  </div>
                  <Link
                    to="/checkout"
                    className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 text-center"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Truck size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Free Delivery</p>
                    <p className="text-sm text-gray-600">On orders over ₹999</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <RotateCcw size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Easy Returns</p>
                    <p className="text-sm text-gray-600">30-day return policy</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Shield size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Secure Payment</p>
                    <p className="text-sm text-gray-600">100% secure transaction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cart.items.length} items)</span>
                    <span className="font-medium">₹{calculateSubtotal().toLocaleString()}</span>
                  </div>
                  
                  {/* GST */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-medium">₹{calculateGST().toLocaleString()}</span>
                  </div>
                  
                  {/* Delivery */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Charge</span>
                    <span className="font-medium">
                      {calculateDelivery() === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${calculateDelivery()}`
                      )}
                    </span>
                  </div>
                  
                  {/* Discount (if any) */}
                  {cart.discount && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount Applied</span>
                      <span>-₹{cart.discount}</span>
                    </div>
                  )}
                  
                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <span>₹{calculateTotal().toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Inclusive of all taxes</p>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  to="/checkout"
                  className="block w-full bg-black text-white py-4 rounded-xl font-bold text-lg text-center hover:bg-gray-800 mt-6"
                >
                  Proceed to Checkout
                </Link>

                {/* Payment Methods */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-3">We Accept:</p>
                  <div className="flex gap-2">
                    {["Cards", 'UPI', 'NetBanking', 'COD'].map((method) => (
                      <div
                        key={method}
                        className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700"
                      >
                        {method}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mt-6 pt-6 border-t">
                  <p className="font-medium text-gray-900 mb-3">Have a Promo Code?</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="text-blue-600">
                    <Shield size={24} />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Secure Checkout</p>
                    <p className="text-sm text-blue-700">
                      Your personal information is protected
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

export default CartPage;