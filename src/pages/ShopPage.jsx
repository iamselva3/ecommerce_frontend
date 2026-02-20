import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight, Heart, ShoppingBag, Eye, Star } from "lucide-react";
import LogoLoader from "../components/LogoLoader";

const API_URL = import.meta.env.VITE_API_URL;

const ShopPage = () => {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [cartProductIds, setCartProductIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  const scrollRefs = useRef({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/images/categories/list`);
        const data = await res.json();

        if (!data.success) throw new Error();
        setCategories(data.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;

    const fetchProducts = async () => {
      try {
        const result = {};

        await Promise.all(
          categories.map(async (category) => {
            const res = await fetch(
              `${API_URL}/api/images/category/${category.slug}`
            );
            const data = await res.json();
            result[category.slug] = data?.data?.images || [];
          })
        );

        setProductsByCategory(result);
      } catch (err) {
        console.error("Product fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categories]);

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        const items = data?.data?.items || data?.items || [];
        setCartProductIds(items.map((i) => i.productId));
      } catch (err) {
        console.error(err);
      }
    };

    fetchCart();
  }, [token]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const items = data.data?.items || [];
        setWishlistIds(items.map(item => item.product?._id || item.productId));
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      }
    };
    fetchWishlist();
  }, [token]);

  const scroll = (slug, dir) => {
    const el = scrollRefs.current[slug];
    if (!el) return;

    el.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  const handleAddToCart = async (item) => {
    if (!token) {
      toast.info("Please login to continue");
      navigate("/login");
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
          productId: item._id,
          name: item.name,
          price: item.price,
          sizes: item.sizes,
          image: item.images?.[0]?.url || item.url,
          qty: 1,
        }),
      });

      if (!res.ok) throw new Error();

      setCartProductIds((prev) => [...prev, item._id]);
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = async (item) => {
    if (!token) {
      toast.info("Please login to continue");
      navigate("/login");
      return;
    }

    navigate("/checkout", {
      state: {
        directProduct: {
          productId: item._id,
          name: item.name,
          price: item.price,
          image: item?.images?.[0]?.url || item.url,
          qty: 1
        }
      }
    });
  };

  const handleAddToWishlist = async (item) => {
    if (!token) {
      toast.info("Please login to continue");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: item._id }),
      });

      if (!res.ok) throw new Error();

      setWishlistIds((prev) => [...prev, item._id]);
      toast.success("Added to wishlist");
    } catch {
      toast.error("Failed to add to wishlist");
    }
  };

  const getDiscountPercentage = (price, originalPrice) => {
    if (!originalPrice || originalPrice <= price) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

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
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Hero Banner */}
      {/* Hero Banner */}
<div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100 py-8 mb-8">
  <div className="container mx-auto px-4">
    <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800">Shop by Category</h1>
    <p className="text-gray-600 max-w-2xl">
      Discover our latest collection across all categories. Find your perfect style today!
    </p>
  </div>
</div>

      <div className="container mx-auto px-4 py-8 space-y-16">
        {categories.map((category) => (
          <section key={category.slug} className="relative group">
            {/* Category Header with decorative elements */}
            <div className="flex items-center justify-between mb-6 pl-14 relative">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {category.name}
                </h2>
                <span className="bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full ml-3">
                  {productsByCategory[category.slug]?.length || 0} Products
                </span>
              </div>
              
              {/* View All Link */}
              <button
                onClick={() => navigate(`/category/${category.slug}`)}
                className="hidden md:flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium group"
              >
                View All
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="relative">
              {/* Navigation Buttons with better styling */}
              <button
                onClick={() => scroll(category.slug, "left")}
                className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all hover:scale-110 border border-gray-200"
                aria-label="Scroll left"
              >
                <ChevronLeft className="text-gray-600" size={20} />
              </button>

              <button
                onClick={() => scroll(category.slug, "right")}
                className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all hover:scale-110 border border-gray-200"
                aria-label="Scroll right"
              >
                <ChevronRight className="text-gray-600" size={20} />
              </button>

              {/* Scrollable Products Container */}
              <div
                ref={(el) => (scrollRefs.current[category.slug] = el)}
                className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide px-14 pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {productsByCategory[category.slug]?.map((item) => {
                  const isInCart = cartProductIds.includes(item._id);
                  const isInWishlist = wishlistIds.includes(item._id);
                  const discount = getDiscountPercentage(item.price, item.originalPrice);

                  return (
                    <div
                      key={item._id}
                      className="min-w-[260px] bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col group/product relative overflow-hidden"
                      onMouseEnter={() => setHoveredProduct(item._id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      {/* Discount Badge */}
                      {discount && (
                        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {discount}% OFF
                        </div>
                      )}

                      {/* Wishlist Button */}
                      <button
                        onClick={() => handleAddToWishlist(item)}
                        className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all ${
                          isInWishlist 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        <Heart size={16} className={isInWishlist ? 'fill-current' : ''} />
                      </button>

                    
                      {/* Product Image */}
                     {/* Product Image */}
<div 
  className="relative overflow-hidden rounded-t-xl cursor-pointer h-64 group/image"
  onClick={() => navigate(`/product/${item._id}`)}
>
  <img
    src={item?.images?.[0]?.url || item.url}
    alt={item.name}
    className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
  />
  
  {/* Quick View Overlay - Only appears on image hover */}
  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/product/${item._id}`);
      }}
      className="bg-white p-3 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
    >
      <Eye size={18} />
    </button>
  </div>
</div>

                      <div className="p-4 flex flex-col flex-1">
                        {/* Product Name and Rating */}
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-gray-800 truncate flex-1">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-0.5 text-yellow-400 ml-2">
                            <Star size={14} fill="currentColor" />
                            <span className="text-xs text-gray-600">4.5</span>
                          </div>
                        </div>

                        {/* Category Tag */}
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block w-fit mb-2">
                          {category.name}
                        </span>

                        {/* Sizes */}
                        <p className="text-xs text-gray-500 mb-2">
                          Sizes:{" "}
                          <span className="font-medium text-gray-700">
                            {item.sizes?.slice(0, 3).join(", ")}
                            {item.sizes?.length > 3 && " + more"}
                          </span>
                        </p>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mt-auto mb-3">
                          <p className="text-lg font-bold text-gray-900">
                            ₹{item.price?.toLocaleString()}
                          </p>
                          {item.originalPrice && (
                            <p className="text-sm text-gray-400 line-through">
                              ₹{item.originalPrice?.toLocaleString()}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            disabled={isInCart}
                            onClick={() => handleAddToCart(item)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              isInCart
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50"
                            }`}
                          >
                            {isInCart ? (
                              <span className="flex items-center justify-center gap-1">
                                <ShoppingBag size={14} />
                                In Cart
                              </span>
                            ) : (
                              "Add to Cart"
                            )}
                          </button>

                          <button
                            onClick={() => handleBuyNow(item)}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {productsByCategory[category.slug]?.length === 0 && (
                  <div className="w-full text-center py-12 bg-gray-50 rounded-lg">
                    <ShoppingBag size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">No products found in this category</p>
                  </div>
                )}

                {/* "View More" Card */}
                {productsByCategory[category.slug]?.length > 0 && (
                  <div className="min-w-[200px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center p-6 hover:border-blue-400 transition-colors group">
                    <button
                      onClick={() => navigate(`/category/${category.slug}`)}
                      className="text-center"
                    >
                      <div className="bg-white p-3 rounded-full mb-3 group-hover:bg-blue-600 transition-colors">
                        <ChevronRight size={24} className="text-gray-600 group-hover:text-white" />
                      </div>
                      <p className="font-medium text-gray-700">View All</p>
                      <p className="text-sm text-gray-500">{productsByCategory[category.slug]?.length}+ Products</p>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile View All Button */}
            <div className="md:hidden text-center mt-4">
              <button
                onClick={() => navigate(`/category/${category.slug}`)}
                className="inline-flex items-center gap-1 text-blue-600 font-medium"
              >
                View All {category.name}
                <ChevronRight size={16} />
              </button>
            </div>
          </section>
        ))}
      </div>

      {/* Add custom scrollbar hide styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ShopPage;