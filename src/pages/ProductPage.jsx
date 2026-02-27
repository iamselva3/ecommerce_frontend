import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Star, Heart, ShoppingBag, ChevronLeft, ChevronRight,
  Truck, Shield, RotateCcw, Package, Check,
  Share2, Eye, Minus, Plus, ArrowLeft, 
  Calendar, Tag, Hash, Image as ImageIcon,
  ThumbsUp, Edit2, Trash2, Filter, ChevronDown, X
} from "lucide-react";
import LogoLoader from "../components/LogoLoader";

const API_URL = import.meta.env.VITE_API_URL;

// Helper function to format sizes for display
const formatSizeForDisplay = (size, category) => {
  if (!size) return size;
  
  // Check if this is a shoe product
  const isShoe = category?.toLowerCase() === "shoes" || category?.toLowerCase() === "shoe";
  
  if (isShoe) {
    // Map letter sizes to numbers for display only
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
  
  // For non-shoe products, just uppercase the size
  return String(size).toUpperCase();
};

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewsStats, setReviewsStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewFilter, setReviewFilter] = useState("all"); // all, with-photos, verified
  
  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: ""
  });

  const handlePrev = () => {
    if (!product?.images?.length) return;
    setCurrentImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (!product?.images?.length) return;
    setCurrentImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/images/${id}`);
        const data = await res.json();

        if (!data.success) throw new Error("Product not found");

        const productData = data.data?.image || data.data;
        setProduct(productData);
        setCurrentImage(0);
        
        // Set default selections (colors only, sizes are just displayed)
        if (productData.colors?.length > 0) {
          setSelectedColor(productData.colors[0]);
        }
        
        // Check wishlist status (if user is logged in)
        if (token) {
          const wishlistRes = await fetch(`${API_URL}/api/wishlist/check/${productData._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (wishlistRes.ok) {
            const wishlistData = await wishlistRes.json();
            setIsWishlisted(wishlistData.isWishlisted || false);
          }
        }
        
        // Fetch reviews for this product
        fetchReviews(productData._id, 1);
        
        // Fetch related products
        fetchRelatedProducts(productData.category, productData._id);

      } catch (err) {
        console.error("Product fetch error:", err);
        toast.error("Failed to load product");
        navigate("/shop");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, token]);

  // Fetch reviews from backend
  const fetchReviews = async (productId, page = 1, filter = reviewFilter) => {
    try {
      setLoadingReviews(true);
      let url = `${API_URL}/api/reviews/product/${productId}?page=${page}&limit=5`;
      
      // Add filter parameters if needed
      if (filter === 'with-photos') {
        url += '&hasImages=true';
      } else if (filter === 'verified') {
        url += '&verified=true';
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.data?.reviews || data.reviews || []);
        setReviewsStats(data.data?.stats || {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        });
        setReviewPage(data.data?.pagination?.page || page);
        setReviewTotalPages(data.data?.pagination?.pages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      toast.error("Failed to load reviews");
    } finally {
      setLoadingReviews(false);
    }
  };

  // Fetch related products from same category
  const fetchRelatedProducts = async (category, currentProductId) => {
    try {
      setLoadingRelated(true);
      const res = await fetch(`${API_URL}/api/images/category/${category}?limit=4`);
      if (res.ok) {
        const data = await res.json();
        // Filter out current product
        const related = (data.data?.images || data.images || [])
          .filter(p => p._id !== currentProductId)
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (err) {
      console.error("Failed to fetch related products:", err);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleAddToCart = async () => {
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
          productId: product._id,
          name: product.name,
          price: product.price,
          sizes: product.sizes,
          image: product.images?.[0]?.url || product.url,
          qty: quantity,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = () => {
    if (!token) {
      toast.info("Please login to continue");
      navigate("/login");
      return;
    }

    navigate("/checkout", {
      state: {
        directProduct: {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.url || product.url,
          qty: quantity
        }
      }
    });
  };

  // Toggle wishlist
  const handleWishlistToggle = async () => {
    if (!token) {
      toast.info("Please login to save to wishlist");
      navigate("/login");
      return;
    }

    try {
      const method = isWishlisted ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/api/wishlist/${product._id}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setIsWishlisted(!isWishlisted);
        // toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };

  // Share product
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Nammacart`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  // Review Handlers
  const handleOpenReviewModal = (review = null) => {
    if (!token) {
      toast.info("Please login to write a review");
      navigate("/login");
      return;
    }

    if (review) {
      setEditingReview(review);
      setReviewForm({
        rating: review.rating,
        title: review.title || "",
        comment: review.comment
      });
    } else {
      setEditingReview(null);
      setReviewForm({
        rating: 5,
        title: "",
        comment: ""
      });
    }
    setShowReviewModal(true);
  };

 const handleSubmitReview = async () => {
  if (!reviewForm.title.trim()) {
    toast.error("Please enter a review title");
    return;
  }
  if (!reviewForm.comment.trim()) {
    toast.error("Please enter your review");
    return;
  }
console.log("Token from localStorage:", token);

  try {
    let url = `${API_URL}/api/reviews/product/${product._id}`;
    let method = "POST";
    
    if (editingReview) {
      url = `${API_URL}/api/reviews/${editingReview._id}`;
      method = "PUT";
    }

    // Get user info from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
        // Add these fields if your backend expects them in the request
        userName: user.name || user.email,
        userId: user._id
      }),
    });

    if (res.ok) {
      toast.success(editingReview ? "Review updated successfully" : "Review posted successfully");
      setShowReviewModal(false);
      fetchReviews(product._id, 1, reviewFilter);
    } else {
      const error = await res.json();
      throw new Error(error.message || "Failed to submit review");
    }
  } catch (err) {
    toast.error(err.message);
  }
};

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Review deleted successfully");
        fetchReviews(product._id, 1, reviewFilter);
      } else {
        throw new Error("Failed to delete review");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}/helpful`, {
        method: "POST",
      });

      if (res.ok) {
        // Update the helpful count in UI
        setReviews(reviews.map(r => 
          r._id === reviewId 
            ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 }
            : r
        ));
        toast.success("Marked as helpful");
      }
    } catch (err) {
      console.error("Failed to mark as helpful:", err);
    }
  };

  const handleFilterChange = (filter) => {
    setReviewFilter(filter);
    fetchReviews(product._id, 1, filter);
  };

  const loadMoreReviews = () => {
    if (reviewPage < reviewTotalPages) {
      fetchReviews(product._id, reviewPage + 1, reviewFilter);
    }
  };

  // Check if user has already reviewed
  const userReview = reviews.find(r => r.user?._id === user._id || r.user === user._id);
  const canReview = token && !userReview;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LogoLoader />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </button>
            <nav className="text-sm text-gray-500">
              <Link to="/" className="hover:text-gray-900">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/shop" className="hover:text-gray-900">Shop</Link>
              <span className="mx-2">/</span>
              <Link to={`/category/${product.category}`} className="hover:text-gray-900 capitalize">
                {product.category}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{product.name}</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="relative bg-white rounded-2xl shadow-sm p-6 mb-4">
              <div className="aspect-square flex items-center justify-center">
                <img
                  src={product.images?.[currentImage]?.url || product.url}
                  alt={product.name}
                  className="max-h-[500px] object-contain"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/500x500?text=No+Image";
                  }}
                />
              </div>
              
              {/* Navigation Arrows */}
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
              
              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg hover:shadow-xl"
              >
                <Heart
                  size={24}
                  className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}
                />
              </button>
            </div>

            {/* Thumbnail Gallery */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-4">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${
                      currentImage === index ? "border-blue-600" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.name} - view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Basic Info */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {product.category?.toUpperCase()}
                </span>
                {product.isFeatured && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                    FEATURED
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={`${
                          i < Math.floor(reviewsStats.averageRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-700">
                    {reviewsStats.averageRating} ({reviewsStats.totalReviews} reviews)
                  </span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-green-600 font-medium">In Stock</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-gray-900">
                  ₹{product.price?.toLocaleString() || "999"}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-2xl text-gray-500 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">
                      SAVE {Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-gray-600 text-sm mt-2">Inclusive of all taxes</p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Colors</h3>
                <div className="flex gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                        selectedColor === color ? "border-black" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      {selectedColor === color && <Check size={16} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes - Now just displayed, not selectable */}
            {product.sizes?.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Available Sizes</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <span
                      key={size}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-center font-medium bg-gray-50 text-gray-700"
                    >
                      {formatSizeForDisplay(size, product.category)}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Select size during checkout</p>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-4 py-3 hover:bg-gray-100"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="px-6 py-3 text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="px-4 py-3 hover:bg-gray-100"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <span className="text-gray-600">Only {product.stock || 10} items left</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                className="bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 flex items-center justify-center gap-3"
              >
                <ShoppingBag size={24} />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700"
              >
                Buy Now
              </button>
            </div>

            {/* Additional Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleShare}
                className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Share2 size={20} />
                Share
              </button>
              <button className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                <Eye size={20} />
                Quick View
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Truck size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-sm text-gray-600">On orders over ₹999</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <RotateCcw size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Easy Returns</p>
                  <p className="text-sm text-gray-600">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Shield size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Secure Payment</p>
                  <p className="text-sm text-gray-600">100% secure transaction</p>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Product Details</h3>
              <div className="space-y-3">
                {product.category && (
                  <div className="flex items-center gap-3">
                    <Tag size={18} className="text-gray-400" />
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium capitalize">{product.category}</span>
                  </div>
                )}
                {product.subCategory && (
                  <div className="flex items-center gap-3">
                    <Hash size={18} className="text-gray-400" />
                    <span className="text-gray-600">Sub Category:</span>
                    <span className="font-medium">{product.subCategory}</span>
                  </div>
                )}
                {product.tags?.length > 0 && (
                  <div className="flex items-center gap-3">
                    <ImageIcon size={18} className="text-gray-400" />
                    <span className="text-gray-600">Tags:</span>
                    <div className="flex gap-2">
                      {product.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {product.createdAt && (
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-gray-400" />
                    <span className="text-gray-600">Added:</span>
                    <span className="font-medium">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          {/* Reviews Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold">Customer Reviews</h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={`${
                          i < Math.floor(reviewsStats.averageRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 font-semibold text-lg">
                    {reviewsStats.averageRating} out of 5
                  </span>
                </div>
                <span className="text-gray-600">{reviewsStats.totalReviews} global ratings</span>
              </div>
            </div>
            
            {/* Rating Distribution */}
            <div className="w-full md:w-64 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm w-8">{star} star</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ 
                        width: `${reviewsStats.totalReviews > 0 
                          ? (reviewsStats.ratingDistribution[star] / reviewsStats.totalReviews) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12">
                    {reviewsStats.ratingDistribution[star] || 0}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleOpenReviewModal()}
              disabled={!canReview}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                canReview
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
              title={!token ? "Login to write a review" : userReview ? "You have already reviewed this product" : ""}
            >
              Write a Review
            </button>
          </div>

          {/* Review Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                reviewFilter === 'all'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Reviews
            </button>
            <button
              onClick={() => handleFilterChange('with-photos')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                reviewFilter === 'with-photos'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              With Photos
            </button>
            <button
              onClick={() => handleFilterChange('verified')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                reviewFilter === 'verified'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Verified Purchases
            </button>
          </div>

          {/* Reviews List */}
          {loadingReviews ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-gray-600">
                          {review.userName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{review.userName || 'Anonymous'}</h4>
                          {review.isVerifiedPurchase && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={`${
                                  i < review.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Review Actions */}
                    {(user._id === review.user?._id || user._id === review.user || user.role === 'admin') && (
                      <div className="flex gap-2">
                        {user._id === review.user?._id && (
                          <button
                            onClick={() => handleOpenReviewModal(review)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit review"
                          >
                            <Edit2 size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete review"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  {review.title && (
                    <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
                  )}
                  <p className="text-gray-700 mb-4">{review.comment}</p>

                  {/* Review Images */}
                  {review.images?.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.url}
                          alt={`Review image ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-90"
                          onClick={() => window.open(img.url, '_blank')}
                        />
                      ))}
                    </div>
                  )}

                  {/* Helpful Button */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleMarkHelpful(review._id)}
                      className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <ThumbsUp size={18} />
                      <span className="text-sm">Helpful ({review.helpfulCount || 0})</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Load More */}
              {reviewPage < reviewTotalPages && (
                <div className="text-center mt-6">
                  <button
                    onClick={loadMoreReviews}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Load More Reviews
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Related Products</h2>
          {loadingRelated ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse h-80 rounded-xl"></div>
              ))}
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={item?.images?.[0]?.url || item?.images?.[0]?.url}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      ₹{item.price?.toLocaleString() || "999"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">No related products found</p>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {editingReview ? "Edit Review" : "Write a Review"}
                </h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Rating Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        size={32}
                        className={`${
                          star <= reviewForm.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Title */}
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  placeholder="Summarize your review"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength="100"
                />
              </div>

              {/* Review Comment */}
              <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Review
                </label>
                <textarea
                  id="comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience with this product"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength="1000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {reviewForm.comment.length}/1000 characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {editingReview ? "Update Review" : "Submit Review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;