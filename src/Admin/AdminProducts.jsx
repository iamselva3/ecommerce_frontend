import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  Search, Filter, Plus, Edit, Trash2, 
  ChevronLeft, ChevronRight, X, Star,
  Package, Tag, Calendar, Eye, Loader
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [stats, setStats] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch products and categories
  useEffect(() => {
    fetchProducts();
  }, []);

  // Extract categories from products when products load
  useEffect(() => {
    if (products.length > 0) {
      extractCategoriesFromProducts();
    }
  }, [products]);

  // Fetch stats when products load
  useEffect(() => {
    if (products.length > 0) {
      calculateStats();
    }
  }, [products]);

  // Apply filters whenever products, search, category, or sort changes
  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, selectedSort]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/images/latest/images`);
      const result = await res.json();

      const list = Array.isArray(result?.data?.images)
        ? result.data.images
        : [];

      setProducts(list);
    } catch (err) {
      toast.error("Failed to load products");
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  };

  const extractCategoriesFromProducts = () => {
    // Extract unique categories from products
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    setCategories(uniqueCategories);
    
    // Also try to fetch from API but don't wait for it
    fetchCategoriesFromAPI();
  };

  const fetchCategoriesFromAPI = async () => {
    try {
      const res = await fetch(`${API_URL}/api/images/categories/list`);
      const result = await res.json();
      
      if (result.success && result.data) {
        let categoryList = [];
        
        // Handle different response structures
        if (Array.isArray(result.data)) {
          // If array of strings
          if (result.data.every(item => typeof item === 'string')) {
            categoryList = result.data;
          } 
          // If array of objects
          else {
            categoryList = result.data.map(item => {
              if (typeof item === 'object' && item !== null) {
                return item.name || item.category || item._id || String(item);
              }
              return String(item);
            }).filter(Boolean);
          }
        } 
        // If object with category counts
        else if (typeof result.data === 'object' && result.data !== null) {
          categoryList = Object.keys(result.data);
        }
        
        // Merge with existing categories and remove duplicates
        if (categoryList.length > 0) {
          setCategories(prev => {
            const merged = [...new Set([...prev, ...categoryList])];
            return merged;
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch categories from API:", err);
      // Already have categories from products, so no need to show error
    }
  };

  const calculateStats = () => {
    const totalProducts = products.length;
    const featuredProducts = products.filter(p => p.isFeatured).length;
    
    // Count new products this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = products.filter(p => {
      const createdDate = new Date(p.createdAt);
      return createdDate >= firstDayOfMonth;
    }).length;

    setStats({
      totalProducts,
      totalCategories: categories.length,
      featuredProducts,
      newThisMonth
    });
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        (p.tags && p.tags.some(tag => String(tag).toLowerCase().includes(term)))
      );
    }

    // Apply sorting
    switch (selectedSort) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "name-asc":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        filtered.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

    try {
      setDeletingId(id);
      const res = await fetch(`${API_URL}/api/images/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted successfully");
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedSort("newest");
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">
            Manage your product inventory
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/upload")}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Product
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold">{stats.totalCategories}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Tag size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Featured</p>
                <p className="text-2xl font-bold">{stats.featuredProducts}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Star size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New This Month</p>
                <p className="text-2xl font-bold">{stats.newThisMonth}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar size={24} className="text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Categories</option>
              {categories.map((cat, index) => {
                // Ensure cat is a string before rendering
                const categoryValue = typeof cat === 'string' ? cat : 
                                     cat?.name || cat?.category || String(cat);
                return (
                  <option key={index} value={categoryValue} className="capitalize">
                    {categoryValue}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Sort Options */}
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
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
          <Loader size={40} className="animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Results Info */}
          {filteredProducts.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
              </p>
            </div>
          )}

          {currentItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentItems.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Image Container */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={p.images?.[0]?.url || "https://via.placeholder.com/300x200?text=No+Image"}
                      alt={p.name || "Product"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                      }}
                    />
                    
                    {/* Featured Badge */}
                    {p.isFeatured && (
                      <span className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Star size={12} className="fill-white" />
                        Featured
                      </span>
                    )}
                    
                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/product/${p._id}`)}
                        className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 mr-1"
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
                          {p.name || "Unnamed Product"}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {p.category || "Uncategorized"}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{p.price?.toLocaleString() || "0"}
                      </p>
                    </div>

                    {/* Tags */}
                    {p.tags && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {p.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                          >
                            {String(tag)}
                          </span>
                        ))}
                        {p.tags.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{p.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stock Status */}
                    <div className="mb-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        p.stock > 10 
                          ? "bg-green-100 text-green-700" 
                          : p.stock > 0 
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {p.stock > 10 ? "In Stock" : p.stock > 0 ? `Only ${p.stock} left` : "Out of Stock"}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => navigate(`/admin/products/edit/${p._id}`)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit size={16} />
                        Edit
                      </button>

                      <button
                        onClick={() => deleteProduct(p._id)}
                        disabled={deletingId === p._id}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1 disabled:bg-red-400"
                      >
                        {deletingId === p._id ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== "all" 
                  ? "Try adjusting your filters" 
                  : "Get started by adding your first product"}
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium"
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
                  // Show first, last, and pages around current
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
                            ? "bg-black text-white"
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

export default AdminProducts;