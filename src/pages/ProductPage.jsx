import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Star, Heart, ShoppingBag, ChevronLeft, ChevronRight,
  Truck, Shield, RotateCcw, Package, Check,
  Share2, Eye, Minus, Plus, ArrowLeft, 
  Calendar, Tag, Hash, Image as ImageIcon
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [productImages, setProductImages] = useState([]);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/images/${id}`);
        const data = await res.json();

        if (!data.success) throw new Error("Product not found");

        const productData = data.data?.image || data.data;
        setProduct(productData);
        
        // Set default selections
        if (productData.sizes?.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
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
        fetchReviews(productData._id);
        
        // Fetch related products
        fetchRelatedProducts(productData.category, productData._id);
        
        // Fetch more images if available (could be from a separate endpoint)
        fetchProductImages(productData._id);

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
  const fetchReviews = async (productId) => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/product/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || data.data?.reviews || []);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
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

  // Fetch additional product images
  const fetchProductImages = async (productId) => {
    try {
      // Assuming you have an endpoint for product variants/images
      const res = await fetch(`${API_URL}/api/products/${productId}/images`);
      if (res.ok) {
        const data = await res.json();
        if (data.images?.length > 0) {
          setProductImages(data.images);
        }
      }
    } catch (err) {
      console.error("Failed to fetch product images:", err);
    }
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!token) {
      toast.info("Please login to add items to cart");
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
          productId: product._id,
          name: product.name,
          price: product.price || 999, // Default price if not in product
          image: product.signedUrl || product.url,
          size: selectedSize,
          color: selectedColor,
          qty: quantity,
        }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      toast.success("Added to cart successfully!");
      
      // Update cart count in navbar (if you have cart context)
      if (window.updateCartCount) {
        window.updateCartCount(data.cartCount || 1);
      }
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  // Buy now
  const handleBuyNow = () => {
    if (!token) {
      toast.info("Please login to continue");
      navigate("/login");
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    // Navigate directly to checkout with product
    navigate("/checkout", {
      state: {
        directProduct: {
          productId: product._id,
          name: product.name,
          price: product.price || 999,
          image: product.signedUrl || product.url,
          size: selectedSize,
          color: selectedColor,
          qty: quantity,
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
        toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
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
        text: `Check out ${product.name} on StyleHub`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  // Calculate average rating
  const calculateAverageRating = () => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
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

  const images = productImages.length > 0 ? productImages : [product];
  const averageRating = calculateAverageRating();

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
                  src={images[currentImageIndex]?.signedUrl || images[currentImageIndex]?.url || product.url}
                  alt={product.name}
                  className="max-h-[500px] object-contain"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/500x500?text=No+Image";
                  }}
                />
              </div>
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
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
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-4">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? "border-black" : "border-transparent"
                    }`}
                  >
                    <img
                      src={img.signedUrl || img.url}
                      alt={`${product.name} ${index + 1}`}
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
                          i < Math.floor(averageRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-700">
                    {averageRating} ({reviews.length} reviews)
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

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Select Size</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 border rounded-lg text-center font-medium transition-all ${
                        selectedSize === size
                          ? "bg-black text-white border-black"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
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
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800">
              Write a Review
            </button>
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{review.user?.name || review.user}</div>
                        {review.verified && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
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
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
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
                      src={item.signedUrl || item.url}
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
    </div>
  );
};

export default ProductPage;