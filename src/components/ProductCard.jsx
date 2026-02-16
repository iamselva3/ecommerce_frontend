import React, { useState } from "react";
import { Star, Heart, ShoppingBag, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const ProductCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[0] || ""
  );
  const [isHovered, setIsHovered] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

 
  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
    toast.success(
      !isWishlisted ? "Added to wishlist" : "Removed from wishlist"
    );
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
        // image:product.images,
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

      
      <button
        onClick={handleAddToWishlist}
        className="absolute top-3 right-3 z-10 bg-white p-2 rounded-full shadow hover:bg-red-50"
      >
        <Heart
          size={18}
          className={
            isWishlisted
              ? "fill-red-500 text-red-500"
              : "text-gray-600"
          }
        />
      </button>

      
      <div className="relative overflow-hidden bg-gray-100">
        <img
          // src={product?.images?.[0]?.url || product.url}
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

    
      <div className="p-4 flex flex-col">
        <span className="text-xs text-gray-500 uppercase">
          {product.category}
        </span>

        <h3 className="font-semibold mt-1 truncate">
          {product.name}
        </h3>

        
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

      
        <p className="text-xl font-bold mt-2">
          ₹{product.price}
        </p>

       
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
