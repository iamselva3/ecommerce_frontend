import React, { useEffect, useState, useRef } from 'react';
import { 
  Search, ShoppingCart, User, Menu, X, 
  ChevronDown, Heart, Bell, Clock, Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [time, setTime] = useState(2 * 60 * 60 + 45 * 60 + 32);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);

  const searchRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const categories = [
    { name: 'Shirts', count: 42 },
    { name: 'T-Shirts', count: 56 },
    { name: 'Jeans', count: 38 },
    { name: 'Jackets', count: 24 },
    { name: 'Shoes', count: 67 },
    { name: 'Accessories', count: 29 },
  ];

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Deals', href: '/deals' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  // Timer effect
  useEffect(() => {
    if (time <= 0) return;

    const interval = setInterval(() => {
      setTime((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [time]);

  // Fetch cart count
  useEffect(() => {
    if (token) {
      fetchCartCount();
      fetchWishlistCount();
    }
  }, [token]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const res = await fetch(`${API_URL}/api/cart/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.count || data.data?.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  };

  // Fetch wishlist count
  const fetchWishlistCount = async () => {
    try {
      const res = await fetch(`${API_URL}/api/wishlist/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWishlistCount(data.count || data.data?.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist count:', error);
    }
  };

  // Handle search input
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSearch(true);
    try {
      const res = await fetch(`${API_URL}/api/images/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        const results = data.data?.images || data.images || [];
        setSearchResults(results.slice(0, 5)); // Show top 5 results
        setShowSuggestions(true);
        
        // Add to recent searches
        if (!recentSearches.includes(query.toLowerCase())) {
          const newRecent = [query.toLowerCase(), ...recentSearches.slice(0, 4)];
          setRecentSearches(newRecent);
          localStorage.setItem('recentSearches', JSON.stringify(newRecent));
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Handle search submit
 const handleSearchSubmit = () => {
  if (searchQuery.trim()) {
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setShowSuggestions(false);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // Navigate to product
 // Navigate to product
const navigateToProduct = (productId) => {
  console.log('Attempting to navigate to product:', productId);
  console.log('Product ID type:', typeof productId);
  console.log('Product ID length:', productId?.length);
  
  // Validate productId
  if (!productId || productId === 'undefined' || productId === 'null') {
    console.error('Invalid product ID:', productId);
    toast.error('Invalid product');
    return;
  }
  
  // Trim and validate
  const cleanProductId = productId.trim();
  if (!cleanProductId || cleanProductId.length < 10) {
    console.error('Product ID too short:', cleanProductId);
    return;
  }
  
  try {
    console.log('Navigating to:', `/product/${cleanProductId}`);
    navigate(`/product/${cleanProductId}`);
    setShowSuggestions(false);
    setSearchQuery('');
  } catch (error) {
    console.error('Navigation error:', error);
    toast.error('Failed to navigate to product');
  }
};

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Format time
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  // Get recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md  pb-1 md:pb-0">
      <div className="w-full px-6 xl:px-16">
        {/* Top Bar */}
        <div className="hidden md:flex justify-between items-center py-2 border-b text-sm">
          <div className="flex items-center space-x-4">
            <span>🛒 Free shipping on orders over ₹500</span>
            <span className="text-green-600 font-semibold">Hot Sale: Up to 50% OFF</span>
          </div>
          <div className="flex items-center space-x-6">
            <select className="bg-transparent border-none focus:outline-none">
              <option>English</option>
              <option>Tamil</option>
              <option>Hindi</option>
            </select>
            <a href="/orders" className="hover:text-blue-600">Track Order</a>
            <a href="/help" className="hover:text-blue-600">Help Center</a>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              className="md:hidden mr-4"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <a href="/" className="flex items-center gap-1 text-2xl font-bold text-blue-600">
              <img
                src="/Logo.png"
                alt="Nammcart Logo"
                className="w-10 h-10 object-contain"
              />
              <span>
                Namma<span className="text-gray-800">Cart</span>
              </span>
            </a>
          </div>

          {/* Categories Dropdown */}
          <div className="relative hidden lg:block">
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              <Menu size={20} />
              <span>All Categories</span>
              <ChevronDown size={16} />
            </button>
            
            {isCategoryOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-2xl rounded-lg p-4 z-50">
                {categories.map((category) => (
                  <a
                    key={category.name}
                    href={`/category/${category.name.toLowerCase()}`}
                    className="flex items-center justify-between py-2 px-3 hover:bg-gray-100 rounded-md"
                  >
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {category.count}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Search Bar with Suggestions */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:block" ref={searchRef}>
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  placeholder="Search for shirts, jeans, shoes..."
                  className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <button
                  onClick={handleSearchSubmit}
                  className="absolute right-2 top-2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700"
                >
                  Search
                </button>
              </div>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-2xl rounded-lg z-50 max-h-96 overflow-y-auto">
                  {/* Recent Searches */}
                  {searchResults.length === 0 && recentSearches.length > 0 && (
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Clock size={14} />
                          Recent Searches
                        </h3>
                        <button
                          onClick={clearRecentSearches}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSearchQuery(search);
                              handleSearch(search);
                            }}
                            className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm flex items-center justify-between"
                          >
                            <span>{search}</span>
                            <Clock size={12} className="text-gray-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  
                  {searchResults.length > 0 && (
                    <>
                      <div className="p-4 border-b">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Products ({searchResults.length})
                        </h3>
                        {loadingSearch ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {searchResults.map((product) => (
                                    <div
        key={product._id}
        onMouseDown={(e) => {
          e.preventDefault(); 
          e.stopPropagation();
          console.log('Mouse down on product:', product._id);
          navigateToProduct(product._id);
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          console.log('Touch start on product:', product._id);
          navigateToProduct(product._id);
        }}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors active:bg-gray-200 select-none"
      >
                                <img
                                  src={product.images?.[0]?.url || product.url}
                                  alt={product.name}
                                  className="w-10 h-10 object-cover rounded"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/40x40?text=No+Image';
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {product.name}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                      {product.category}
                                    </span>
                                    {product.price && (
                                      <span className="text-xs font-semibold text-gray-700">
                                        ₹{product.price}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Package size={14} className="text-gray-400" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    
                      <div className="p-3 border-t">
                        <button
                          onClick={handleSearchSubmit}
                          className="w-full text-center text-blue-600 hover:text-blue-700 font-medium py-2"
                        >
                          View all results for "{searchQuery}"
                        </button>
                      </div>
                    </>
                  )}

                  {/* No Results */}
                  {searchResults.length === 0 && searchQuery.length >= 2 && !loadingSearch && (
                    <div className="p-8 text-center">
                      <Package size={32} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No products found for "{searchQuery}"</p>
                      <p className="text-sm text-gray-500 mt-1">Try different keywords</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-6">
            <button className="relative">
              <a href='/profile'>
                <User size={24} className="text-gray-700 hover:text-blue-600" />
              </a>
            </button>
            
            <button className="relative hidden md:block">
              <a href='/wishlist'>
                <Heart size={24} className="text-gray-700 hover:text-red-600" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </a>
            </button>
            
            <button className="relative">
              <a href="/cart">
                <ShoppingCart size={24} className="text-gray-700 hover:text-blue-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </a>
            </button>
            
            {/* <button 
              className="md:hidden"
              onClick={() => {
                const searchInput = document.querySelector('.mobile-search-input');
                if (searchInput) searchInput.focus();
              }}
            >
              <Search size={24} />
            </button> */}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mb-4">
          <div className="relative" ref={searchRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search products..."
              className="mobile-search-input w-full px-4 py-2 pl-10 rounded-lg border border-gray-300"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            
            {/* Mobile Suggestions */}
            {showSuggestions && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-2xl rounded-lg z-50 max-h-80 overflow-y-auto">
                <div className="p-3 border-b">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Products</h3>
                  <div className="space-y-2">
                    {searchResults.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => navigateToProduct(product._id)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                      >
                        <img
                          src={product.signedUrl || product.url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                              {product.category}
                            </span>
                            {product.price && (
                              <span className="text-xs font-semibold text-gray-700">
                                ₹{product.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg rounded-lg p-4 mb-4">
            <div className="space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block py-2 px-3 hover:bg-gray-100 rounded-md font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}

              <div className="flex items-center space-x-4 py-2 px-3 border-t border-b">
        <a 
          href="/profile" 
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          onClick={() => setIsMenuOpen(false)}
        >
          <User size={20} />
          <span>Profile</span>
        </a>
        <a 
          href="/wishlist" 
          className="flex items-center gap-2 text-gray-700 hover:text-red-600"
          onClick={() => setIsMenuOpen(false)}
        >
          <Heart size={20} />
          <span>Wishlist</span>
          {wishlistCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {wishlistCount > 9 ? '9+' : wishlistCount}
            </span>
          )}
        </a>
      </div>
      
              <div className="pt-4 border-t">
                <h3 className="font-bold mb-2">Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <a
                      key={category.name}
                      href={`/category/${category.name.toLowerCase()}`}
                      className="text-sm py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="hidden md:flex items-center justify-between py-3 border-t">
          <div className="flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-medium hover:text-blue-600"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-green-600 font-semibold flex items-center">
              <Bell size={16} className="mr-1" />
              Flash Sale: Ends in{" "}
              {String(hours).padStart(2, "0")}:
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;