import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Heart,
  ShoppingBag,
  Trash2,
  Eye,
  Star,
  Truck,
  Tag,
  ChevronRight,
  Package,
  Search,
  Filter,
  Ruler,
  Layers,
} from "lucide-react";
import LogoLoader from "../components/LogoLoader";

const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : "";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartProductIds, setCartProductIds] = useState({});
  const [categories, setCategories] = useState([
    { id: "all", name: "All Items", count: 0 },
    { id: "shirts", name: "Shirts", count: 0 },
    { id: "pants", name: "Pants", count: 0 },
    { id: "tshirts", name: "T-Shirts", count: 0 },
    { id: "jackets", name: "Jackets", count: 0 },
    { id: "accessories", name: "Accessories", count: 0 },
  ]);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user._id) {
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, [user._id, navigate]);

  useEffect(() => {
    filterWishlistItems();
  }, [wishlist, searchQuery, selectedCategory]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/wishlist`, {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        // Extract product items from wishlist
        const wishlistData = data.data?.items || [];
        
        // Transform to get product details
        const items = wishlistData.map(item => ({
          ...item.product,
          wishlistItemId: item._id,
          addedAt: item.addedAt
        }));

        // Remove duplicates (temporary fix until backend is updated)
        const uniqueItems = items.filter((item, index, self) =>
          index === self.findIndex(t => t._id === item._id)
        );

        setWishlist(uniqueItems);
        updateCategoryCounts(uniqueItems);
      } else {
        toast.error(data.message || "Failed to load wishlist");
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  // Add this after your existing useEffects
useEffect(() => {
  const fetchCartStatus = async () => {
    if (!user._id) return;
    
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        credentials: "include"
      });
      
      if (res.ok) {
        const data = await res.json();
        const cartMap = {};
        data.data?.items?.forEach(item => {
          cartMap[item.productId] = true;
        });
        setCartProductIds(cartMap);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };
  
  fetchCartStatus();
}, [user._id]);

  const updateCategoryCounts = (items) => {
    const itemsArray = Array.isArray(items) ? items : [];
    const newCategories = [...categories];

    // Reset counts
    newCategories.forEach(cat => cat.count = 0);

    // Count items per category
    itemsArray.forEach(item => {
      const itemCategory = item.category?.toLowerCase() || "all";
      newCategories.forEach(cat => {
        if (cat.id === "all") {
          cat.count = itemsArray.length;
        } else if (cat.id === itemCategory) {
          cat.count++;
        }
      });
    });

    setCategories(newCategories);
  };

  const filterWishlistItems = () => {
    const wishlistArray = Array.isArray(wishlist) ? wishlist : [];
    let filtered = [...wishlistArray];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item =>
        item.category?.toLowerCase() === selectedCategory
      );
    }

    setFilteredItems(filtered);
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await fetch(`${API_URL}/api/wishlist/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setWishlist(prev => prev.filter(item => item._id !== productId));
        toast.success("Removed from wishlist");
      } else {
        toast.error(data.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove item");
    }
  };

  //new
  
const addToCart = async (item) => {
  console.log("sdgvdsgv", item);
  
  if (!user._id) {
    toast.info("Please login to continue");
    navigate("/login");
    return;
  }

  try {
    let itemSizes = [];
    
    if (item.sizes && item.sizes.length > 0) {
      itemSizes = item.sizes;
    } else if (item.product && item.product.sizes) {
      itemSizes = item.product.sizes;
    } else {
      itemSizes = ["m"];
    }
    
    const normalizedSizes = itemSizes.map(size => size.toLowerCase());

    const res = await fetch(`${API_URL}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        productId: item._id,
        name: item.name,
        price: item.price,
        sizes: normalizedSizes,
        image: item.images?.[0]?.url || item.url || item.image,
        qty: 1,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Cart API error:", errorData);
      throw new Error();
    }

    // Update cart status
    setCartProductIds(prev => ({ ...prev, [item._id]: true }));
    toast.success("Added to cart");
  } catch (error) {
    console.error("Error adding to cart:", error);
    toast.error("Failed to add to cart");
  }
};


const moveAllToCart = async () => {
  try {
    const loadingToast = toast.loading("Moving items to cart...");
    
    let successCount = 0;
    let failCount = 0;
    let alreadyInCartCount = 0;
    const successfullyMovedItems = [];

    for (const item of filteredItems) {
      try {
        if (cartProductIds[item._id]) {
          alreadyInCartCount++;
          successfullyMovedItems.push(item._id);
          continue;
        }

        // Get sizes and normalize them
        let itemSizes = item.sizes || ["m"];
        if (itemSizes.length === 0) {
          itemSizes = ["m"];
        }
        const normalizedSizes = itemSizes.map(size => size.toLowerCase());

        const res = await fetch(`${API_URL}/api/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            productId: item._id,
            name: item.name,
            price: item.price,
            sizes: normalizedSizes, 
            image: item.images?.[0]?.url || item.url || item.image,
            qty: 1,
          }),
        });

        if (res.ok) {
          successCount++;
          successfullyMovedItems.push(item._id);
          setCartProductIds(prev => ({ ...prev, [item._id]: true }));
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    if (successfullyMovedItems.length > 0) {
      await removeMultipleFromWishlist(successfullyMovedItems);
    }

    toast.dismiss(loadingToast);
    
    let message = [];
    if (successCount > 0) {
      message.push(`${successCount} item${successCount > 1 ? 's' : ''} added to cart`);
    }
    if (alreadyInCartCount > 0) {
      message.push(`${alreadyInCartCount} item${alreadyInCartCount > 1 ? 's' : ''} already in cart`);
    }
    if (failCount > 0) {
      message.push(`${failCount} item${failCount > 1 ? 's' : ''} failed`);
    }
    
    if (message.length > 0) {
      toast.success(message.join('. '));
    }
  } catch (error) {
    toast.error("Failed to move all items to cart");
  }
};


const removeMultipleFromWishlist = async (productIds) => {
  try {
   
    await Promise.all(
      productIds.map(productId =>
        fetch(`${API_URL}/api/wishlist/${productId}`, {
          method: "DELETE",
          credentials: "include",
        })
      )
    );
  
    setWishlist(prev => prev.filter(item => !productIds.includes(item._id)));
    
  } catch (error) {
    console.error("Error removing from wishlist:", error);
  }
};

  const clearWishlist = async () => {
    if (!window.confirm("Are you sure you want to clear your entire wishlist?")) return;

    try {
      const res = await fetch(`${API_URL}/api/wishlist/clear`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setWishlist([]);
        toast.success("Wishlist cleared");
      } else {
        toast.error(data.message || "Failed to clear wishlist");
      }
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast.error("Failed to clear wishlist");
    }
  };

  const navigateToProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">
            <LogoLoader />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <button onClick={() => navigate("/")} className="hover:text-gray-900">
              Home
            </button>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-900 font-medium">My Wishlist</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-2">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>

            <div className="flex gap-3">
              {wishlist.length > 0 && (
                <>
                  <button
                    onClick={moveAllToCart}
                    className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Move All to Cart
                  </button>
                  <button
                    onClick={clearWishlist}
                    className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        {wishlist.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in wishlist..."
                    className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
              </div>

              {/* Category Filter */}
              <div className="md:w-64">
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                  <Filter className="absolute right-3 top-2.5 text-gray-400" size={18} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-pink-100 rounded-full mb-6">
              <Heart className="h-12 w-12 text-pink-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your wishlist is empty</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Save items you love to your wishlist. Review them anytime and easily move them to the bag.
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800"
            >
              Start Shopping
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No matching items</h2>
            <p className="text-gray-600 mb-8">
              No items match your search or filter criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-6 bg-white rounded-xl shadow-sm p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3">
                  <div className="text-2xl font-bold text-gray-900">{filteredItems.length}</div>
                  <div className="text-sm text-gray-600">Items</div>
                </div>
                <div className="text-center p-3">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredItems.filter(item => item.inStock !== false).length}
                  </div>
                  <div className="text-sm text-gray-600">In Stock</div>
                </div>
                <div className="text-center p-3">
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{filteredItems.reduce((total, item) => total + (item.price || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Value</div>
                </div>
                <div className="text-center p-3">
                  <div className="text-2xl font-bold text-blue-600">
                    {new Set(filteredItems.map(item => item.category)).size}
                  </div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
              </div>
            </div>

            {/* Wishlist Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div key={item._id} className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
                  {/* Product Image */}
                  <div className="relative overflow-hidden rounded-t-xl">
                    <img
                      src={item.images?.[0]?.url || item.image || item.url || "https://via.placeholder.com/300x300"}
                      alt={item.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x300";
                      }}
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {item.inStock !== false ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          In Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                          Out of Stock
                        </span>
                      )}
                      {item.isFeatured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                      <button
                        onClick={() => navigateToProduct(item._id)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                        title="View Product"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item._id)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-red-100 text-red-500"
                        title="Remove from wishlist"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Quick Add to Cart */}
                    {/* {item.inStock !== false && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => addToCart(item)}
                          className="w-full bg-white text-black py-2 rounded-lg font-medium hover:bg-gray-100"
                        >
                          Add to Cart
                        </button>
                      </div>
                    )} */}
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    {/* Category */}
                    <div className="mb-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {item.category || "General"}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                      {item.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.description || "No description available"}
                    </p>

                    {/* Sizes Section */}
                    {item.sizes && item.sizes.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Ruler size={14} />
                          <span>Available Sizes:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.sizes.slice(0, 4).map((size, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-200"
                            >
                              {size.toUpperCase()}
                            </span>
                          ))}
                          {item.sizes.length > 4 && (
                            <span className="px-2 py-1 text-xs text-gray-500">
                              +{item.sizes.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Colors Section */}
                    {item.colors && item.colors.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Layers size={14} />
                          <span>Colors:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.colors.slice(0, 3).map((color, index) => (
                            <div
                              key={index}
                              className="w-5 h-5 rounded-full border border-gray-300"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                          {item.colors.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{item.colors.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          ₹{item.price?.toLocaleString() || "0"}
                        </span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₹{item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {item.discount && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                          {item.discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    {item.rating && (
                      <div className="flex items-center mb-4">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={`${
                                i < Math.floor(item.rating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">
                          ({item.reviewCount || 0})
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(item)}
                        disabled={item.inStock === false}
                        className={`flex-1 py-2 rounded-lg font-medium text-center transition-colors
                          ${item.inStock !== false
                            ? "bg-black text-white hover:bg-gray-800"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                      >
                        {item.inStock !== false ? "Add to Cart" : "Out of Stock"}
                      </button>

                      <button
                        onClick={() => removeFromWishlist(item._id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                        title="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Added Date */}
                    {item.addedAt && (
                      <p className="text-xs text-gray-400 mt-2">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Wishlist Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 mb-2">You have {filteredItems.length} items in your wishlist</p>
                  <p className="text-gray-600">
                    Total value: <span className="font-bold text-lg">
                      ₹{filteredItems.reduce((total, item) => total + (item.price || 0), 0).toLocaleString()}
                    </span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={moveAllToCart}
                    className="flex-1 bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 flex items-center justify-center"
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Move All to Cart
                  </button>
                  <button
                    onClick={() => navigate("/shop")}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center"
                  >
                    <Package className="h-5 w-5 mr-2" />
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tips Section */}
        {wishlist.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Wishlist Tips
            </h3>
            <ul className="text-blue-700 text-sm space-y-2">
              <li className="flex items-start">
                <Tag className="h-4 w-4 mr-2 mt-0.5" />
                Items in your wishlist are saved for 60 days
              </li>
              <li className="flex items-start">
                <Truck className="h-4 w-4 mr-2 mt-0.5" />
                Get notified when items go on sale or come back in stock
              </li>
              <li className="flex items-start">
                <ShoppingBag className="h-4 w-4 mr-2 mt-0.5" />
                Easily move items to your cart when you're ready to buy
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
