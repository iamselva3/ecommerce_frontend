import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Sliders, Grid, List, Package, Star, Clock, Heart } from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : "";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistStatus, setWishlistStatus] = useState({});
  const [wishlistLoading, setWishlistLoading] = useState({});
  
  // Filter states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [categories, setCategories] = useState([]);
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch search results
  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/api/images/search?q=${encodeURIComponent(query)}&limit=50`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }
        
        const data = await response.json();
        const productsData = data.data?.images || data.images || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(productsData.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
        // After products are loaded, check wishlist status for each
        if (user._id && productsData.length > 0) {
          checkWishlistStatusForProducts(productsData);
        }
        
      } catch (err) {
        console.error('Search error:', err);
        setError(err.message);
        toast.error('Failed to load search results');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  // Check wishlist status for all products
  const checkWishlistStatusForProducts = async (productsList) => {
    try {
      const statusMap = {};
      
      // Check each product individually (or you could create a batch endpoint)
      await Promise.all(
        productsList.map(async (product) => {
          try {
            const res = await fetch(`${API_URL}/api/wishlist/check/${product._id}`, {
              credentials: "include",
            });
            
            if (res.ok) {
              const data = await res.json();
              statusMap[product._id] = data.isWishlisted || false;
            }
          } catch (error) {
            console.error(`Error checking wishlist for product ${product._id}:`, error);
          }
        })
      );
      
      setWishlistStatus(statusMap);
    } catch (error) {
      console.error("Error checking wishlist statuses:", error);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...products];
    
    // Apply price filter
    filtered = filtered.filter(p => {
      const price = parseFloat(p.price) || 0;
      return price >= priceRange.min && price <= priceRange.max;
    });
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
        case 'price-high':
          return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0; // relevance - keep original order
      }
    });
    
    setFilteredProducts(filtered);
  }, [products, priceRange, selectedCategory, sortBy]);

  const navigateToProduct = (productId) => {
    if (!productId) {
      toast.error('Invalid product');
      return;
    }
    navigate(`/product/${productId}`);
  };

  const handleWishlistToggle = async (productId) => {
    if (!user._id) {
      toast.error('Please login to manage wishlist');
      navigate('/login');
      return;
    }

    // Set loading state for this specific product
    setWishlistLoading(prev => ({ ...prev, [productId]: true }));

    try {
      const isWishlisted = wishlistStatus[productId];
      const method = isWishlisted ? 'DELETE' : 'POST';
      
      const response = await fetch(`${API_URL}/api/wishlist/${productId}`, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: "include",
          body: JSON.stringify({ productId }),
        });

      if (response.ok) {
        // Update the wishlist status for this product
        setWishlistStatus(prev => ({
          ...prev,
          [productId]: !isWishlisted
        }));
        
        // toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${isWishlisted ? 'remove from' : 'add to'} wishlist`);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Something went wrong');
    } finally {
      setWishlistLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Reset filters
  const resetFilters = () => {
    setPriceRange({ min: 0, max: 10000 });
    setSelectedCategory('all');
    setSortBy('relevance');
  };

  // Calculate price stats
  const priceStats = products.reduce(
    (acc, product) => {
      const price = parseFloat(product.price) || 0;
      return {
        min: Math.min(acc.min, price),
        max: Math.max(acc.max, price),
      };
    },
    { min: Infinity, max: 0 }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Search Results for "{query}"
              </h1>
              <p className="text-gray-600 mt-2">
                Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                >
                  <List size={20} />
                </button>
              </div>
              
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">Sort by: Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                  <option value="newest">Newest First</option>
                </select>
                <Sliders size={16} className="absolute right-3 top-3 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Search Stats Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Search size={18} className="text-gray-500" />
                  <span className="font-medium">Search Query:</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {query}
                  </span>
                </div>
                
                <div className="hidden md:block">
                  {selectedCategory !== 'all' && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                      Category: {selectedCategory}
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={resetFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter size={20} />
                <h2 className="text-xl font-bold">Filters</h2>
              </div>

              {/* Category Filter */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4 text-gray-700">Categories</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === 'all'}
                      onChange={() => setSelectedCategory('all')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>All Categories</span>
                    <span className="ml-auto text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {products.length}
                    </span>
                  </label>
                  
                  {categories.map((category) => (
                    <label key={category} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="capitalize">{category}</span>
                      <span className="ml-auto text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {products.filter(p => p.category === category).length}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4 text-gray-700">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{priceRange.min}</span>
                    <span>₹{priceRange.max}</span>
                  </div>
                  <input
                    type="range"
                    min={priceStats.min || 0}
                    max={priceStats.max || 10000}
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 mb-1">Min</label>
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        min="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 mb-1">Max</label>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 10000 }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        max="100000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3 text-gray-700">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Products Found:</span>
                    <span className="font-semibold">{filteredProducts.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Average Price:</span>
                    <span className="font-semibold">
                      ₹{products.length > 0 
                        ? Math.round(products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0) / products.length)
                        : 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Categories:</span>
                    <span className="font-semibold">{categories.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Searches */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4 text-gray-700">Related Searches</h3>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 6).map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {error ? (
              <div className="text-center py-12">
                <Package size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Error Loading Results
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Search size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Products Found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                {/* Products Display */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => {
                      const isWishlisted = wishlistStatus[product._id] || false;
                      const isLoading = wishlistLoading[product._id] || false;
                      
                      return (
                        <div
                          key={product._id}
                          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                        >
                          <div className="relative">
                            <img
                              src={product.images?.[0]?.url || product.url}
                              alt={product.name}
                              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                              }}
                            />
                            <button
                              onClick={() => handleWishlistToggle(product._id)}
                              disabled={isLoading}
                              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all disabled:opacity-50"
                            >
                              <Heart 
                                size={20} 
                                className={`transition-colors ${
                                  isWishlisted 
                                    ? "fill-red-500 text-red-500" 
                                    : "text-gray-600"
                                } ${isLoading ? "animate-pulse" : ""}`} 
                              />
                            </button>
                            {product.price && (
                              <div className="absolute top-3 left-3">
                                <span className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                                  ₹{product.price}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 line-clamp-1">
                                  {product.name}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2 min-h-[40px]">
                                  {product.description || 'No description available'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2">
                                {product.category && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                    {product.category}
                                  </span>
                                )}
                                {product.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star size={12} className="text-yellow-400 fill-current" />
                                    <span className="text-xs text-gray-600">{product.rating}</span>
                                  </div>
                                )}
                              </div>
                              
                              <button
                                onClick={() => navigateToProduct(product._id)}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // List View
                  <div className="space-y-4">
                    {filteredProducts.map((product) => {
                      const isWishlisted = wishlistStatus[product._id] || false;
                      const isLoading = wishlistLoading[product._id] || false;
                      
                      return (
                        <div
                          key={product._id}
                          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                        >
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/4">
                              <img
                                src={product.images?.[0]?.url || product.url}
                                alt={product.name}
                                className="w-full h-48 md:h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                                }}
                              />
                            </div>
                            
                            <div className="flex-1 p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {product.name}
                                  </h3>
                                  <p className="text-gray-600 mb-4 line-clamp-2">
                                    {product.description || 'No description available'}
                                  </p>
                                </div>
                                
                                <div className="flex flex-col items-end gap-2">
                                  {product.price && (
                                    <span className="text-2xl font-bold text-blue-600">
                                      ₹{product.price}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleWishlistToggle(product._id)}
                                    disabled={isLoading}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-all disabled:opacity-50"
                                  >
                                    <Heart 
                                      size={20} 
                                      className={`transition-colors ${
                                        isWishlisted 
                                          ? "fill-red-500 text-red-500" 
                                          : "text-gray-600"
                                      } ${isLoading ? "animate-pulse" : ""}`} 
                                    />
                                  </button>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  {product.category && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                      {product.category}
                                    </span>
                                  )}
                                  {product.rating && (
                                    <div className="flex items-center gap-1">
                                      <Star size={14} className="text-yellow-400 fill-current" />
                                      <span className="text-sm text-gray-600">{product.rating}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => navigateToProduct(product._id)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                  >
                                    View Product
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
