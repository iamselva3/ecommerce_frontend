import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { 
  Star, Search, Filter, X, ChevronLeft, ChevronRight,
  Eye, Calendar, Tag, Package, Heart, Loader
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const AdminFeatured = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [togglingId, setTogglingId] = useState(null);
  
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchFeaturedItems();
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      extractCategories();
    }
  }, [items]);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, selectedCategory]);

  const fetchFeaturedItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/images/featured/images`);
      const data = await res.json();
      
      const featuredList = data?.data?.images || [];
      setItems(featuredList);
      setFilteredItems(featuredList);
    } catch (err) {
      console.error("Failed to fetch featured items:", err);
      toast.error("Failed to load featured products");
    } finally {
      setLoading(false);
    }
  };

  const extractCategories = () => {
    const uniqueCategories = [...new Set(items.map(item => item.category).filter(Boolean))];
    setCategories(uniqueCategories);
  };

  const filterItems = () => {
    let filtered = [...items];

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        (item.tags && item.tags.some(tag => String(tag).toLowerCase().includes(term)))
      );
    }

    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const toggleFeatured = async (id) => {
    try {
      setTogglingId(id);
      const res = await fetch(`${API_URL}/api/images/${id}/toggle-featured`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!res.ok) throw new Error("Failed to toggle featured status");

      const updatedItems = items.map((i) =>
        i._id === id ? { ...i, isFeatured: !i.isFeatured } : i
      );
      
      setItems(updatedItems);
      
      const newStatus = !items.find(i => i._id === id)?.isFeatured;
      toast.success(newStatus ? "Added to featured" : "Removed from featured");
    } catch (err) {
      console.error("Toggle error:", err);
      toast.error("Failed to update featured status");
    } finally {
      setTogglingId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Statistics
  const featuredCount = items.filter(item => item.isFeatured).length;
  const regularCount = items.length - featuredCount;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Featured Products</h1>
        <p className="text-gray-600 mt-1">
          Manage which products appear in featured sections
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold">{items.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Featured</p>
              <p className="text-2xl font-bold text-yellow-600">{featuredCount}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Star size={24} className="text-yellow-600 fill-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Regular</p>
              <p className="text-2xl font-bold">{regularCount}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <Heart size={24} className="text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Categories</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat} className="capitalize">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <X size={18} />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader size={40} className="animate-spin text-yellow-600" />
        </div>
      ) : (
        <>
          {/* Results Info */}
          {filteredItems.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} products
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star size={14} className="fill-yellow-700" />
                  Featured: {filteredItems.filter(i => i.isFeatured).length}
                </span>
              </div>
            </div>
          )}

          {currentItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentItems.map((item) => (
                <div
                  key={item._id}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group ${
                    item.isFeatured ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  {/* Image Container */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={item.images?.[0]?.url || "https://via.placeholder.com/300x200?text=No+Image"}
                      alt={item.name || "Product"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                      }}
                    />
                    
                    {/* Featured Badge */}
                    {item.isFeatured && (
                      <span className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Star size={12} className="fill-white" />
                        Featured
                      </span>
                    )}
                    
                    {/* Quick View Button */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => window.open(`/product/${item._id}`, '_blank')}
                        className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100"
                        title="View Product"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate max-w-[150px]">
                          {item.name || "Unnamed Product"}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize flex items-center gap-1">
                          <Tag size={12} />
                          {item.category || "Uncategorized"}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <p className="text-lg font-bold text-gray-900 mb-3">
                      ₹{item.price?.toLocaleString() || "0"}
                    </p>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                          >
                            {String(tag)}
                          </span>
                        ))}
                        {item.tags.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{item.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Date */}
                    {item.createdAt && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <Calendar size={12} />
                        Added: {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    )}

                    {/* Toggle Button */}
                    <button
                      onClick={() => toggleFeatured(item._id)}
                      disabled={togglingId === item._id}
                      className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        item.isFeatured
                          ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {togglingId === item._id ? (
                        <Loader size={18} className="animate-spin" />
                      ) : (
                        <>
                          <Star size={18} className={item.isFeatured ? 'fill-white' : ''} />
                          {item.isFeatured ? 'Unfeature' : 'Mark as Featured'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <Star size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== "all" 
                  ? "Try adjusting your filters" 
                  : "No products available to feature"}
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <button
                  onClick={clearFilters}
                  className="text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium ${
                          currentPage === pageNum
                            ? "bg-yellow-400 text-gray-900"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={i} className="px-2">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminFeatured;