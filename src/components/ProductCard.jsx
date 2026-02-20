import React, { useState, useEffect } from "react";
import { Star, Heart, ShoppingBag, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const ProductCard = ({ product }) => {
  console.log("product", product);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[0] || ""
  );
  const [isHovered, setIsHovered] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Check if product is in wishlist on component mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!token || !product?._id) return;
      
      try {
        const response = await fetch(`${API_URL}/api/wishlist/check/${product._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsWishlisted(data.isWishlisted || false);
        }
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [product._id, token]); // Added proper dependencies

  const handleWishlistToggle = async (productId) => {
    console.log("Toggling wishlist for:", productId);
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('Please login to manage wishlist');
      navigate('/login');
      return;
    }

    setWishlistLoading(true);

    try {
      const method = isWishlisted ? 'DELETE' : 'POST';
      const response = await fetch(`${API_URL}/api/wishlist/${productId}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsWishlisted(!isWishlisted);
        toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${isWishlisted ? 'remove from' : 'add to'} wishlist`);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Something went wrong');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.info("Please login to continue");
      navigate("/login");
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id || product.id,
          name: product.name,
          price: product.price,
          sizes: [selectedSize.toLowerCase()],
          image: product?.images?.[0]?.url || product.url,
          qty: 1,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Added to cart 🛒");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart");
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product._id || product.id}`);
  };

  return (
    <div
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.isNew && (
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            NEW
          </span>
        )}
        {product.isSale && (
          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            SALE
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={() => handleWishlistToggle(product._id || product.id)}
        disabled={wishlistLoading}
        className="absolute top-3 right-3 z-10 bg-white p-2 rounded-full shadow hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Heart
          size={18}
          className={`${
            isWishlisted
              ? "fill-red-500 text-red-500"
              : "text-gray-600"
          } ${wishlistLoading ? "animate-pulse" : ""}`}
        />
      </button>

      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-100">
        <img
          src={product.images || "No image to preview"}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {isHovered && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <button
              onClick={handleQuickView}
              className="bg-white px-4 py-2 rounded-lg flex items-center gap-2 shadow"
            >
              <Eye size={18} /> Quick View
            </button>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col">
        <span className="text-xs text-gray-500 uppercase">
          {product.category}
        </span>

        <h3 className="font-semibold mt-1 truncate">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mt-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={
                i < Math.floor(product.rating || 4)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }
            />
          ))}
          <span className="text-sm text-gray-600 ml-2">
            {product.rating || 4.0}
          </span>
        </div>

        {/* Price */}
        <p className="text-xl font-bold mt-2">
          ₹{product.price}
        </p>

        {/* Size Selection */}
        <div className="mt-3">
          <p className="text-xs text-gray-600 mb-1">Select Size</p>
          <div className="flex gap-2 flex-wrap">
            {product.sizes?.map((size) => (
              <button
                key={size}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedSize(size);
                }}
                className={`px-3 py-1 text-sm border rounded ${
                  selectedSize === size
                    ? "bg-black text-white"
                    : "hover:border-black"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className="mt-4 bg-gray-900 text-white py-3 rounded-lg flex items-center justify-center hover:bg-black transition"
        >
          <ShoppingBag size={18} className="mr-2" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;