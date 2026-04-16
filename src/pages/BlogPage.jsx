import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Calendar, User, Tag, Clock, ArrowRight, Search,
  ChevronLeft, ChevronRight, Eye, Heart, MessageCircle,
  Share2, Bookmark, Filter, X, TrendingUp, Star
} from "lucide-react";
import LogoLoader from "../components/LogoLoader";

const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : "";

const BlogPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(parseInt(queryParams.get('page')) || 1);
  const [selectedCategory, setSelectedCategory] = useState(queryParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState(queryParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(queryParams.get('search') || '');
  const [sortBy, setSortBy] = useState(queryParams.get('sort') || 'newest');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalComments: 0
  });

  // Fetch blog posts
  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchPopularPosts();
    fetchStats();
  }, [currentPage, selectedCategory, searchQuery, sortBy]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/blog/posts?page=${currentPage}&limit=9&sort=${sortBy}`;
      
      if (selectedCategory !== 'all') {
        url += `&category=${selectedCategory}`;
      }
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setPosts(data.data.posts);
        setTotalPages(data.data.pagination.pages);
      } else {
        toast.error("Failed to load blog posts");
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/blog/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchPopularPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/blog/posts/popular?limit=5`);
      const data = await res.json();
      if (data.success) {
        setPopularPosts(data.data);
      }
    } catch (err) {
      console.error("Error fetching popular posts:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/blog/stats`);
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
    updateUrlParams(1, selectedCategory, searchInput, sortBy);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    updateUrlParams(1, category, searchQuery, sortBy);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
    updateUrlParams(1, selectedCategory, searchQuery, sort);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateUrlParams(page, selectedCategory, searchQuery, sortBy);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateUrlParams = (page, category, search, sort) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page);
    if (category !== 'all') params.set('category', category);
    if (search) params.set('search', search);
    if (sort !== 'newest') params.set('sort', sort);
    
    navigate({ search: params.toString() }, { replace: true });
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSearchInput('');
    setSortBy('newest');
    setCurrentPage(1);
    navigate('/blog', { replace: true });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content?.split(/\s+/).length || 0;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, readTime);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Nammacart Blog</h1>
            <p className="text-xl opacity-90 mb-8">
              Discover the latest trends, fashion tips, and style inspiration
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search articles..."
                className="w-full px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 pr-12"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors"
              >
                <Search size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalPosts}</div>
              <div className="text-sm text-gray-600">Articles</div>
            </div>
            <div className="text-center border-x">
              <div className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalComments}</div>
              <div className="text-sm text-gray-600">Comments</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Filters Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    <Filter size={18} />
                    Filters
                  </button>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>
                
                {(selectedCategory !== 'all' || searchQuery) && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Active filters:</span>
                    {selectedCategory !== 'all' && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1">
                        {selectedCategory}
                        <button onClick={() => handleCategoryChange('all')}>
                          <X size={14} />
                        </button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1">
                        "{searchQuery}"
                        <button onClick={() => {
                          setSearchQuery('');
                          setSearchInput('');
                        }}>
                          <X size={14} />
                        </button>
                      </span>
                    )}
                    <button
                      onClick={clearFilters}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Blog Posts Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.map((post, index) => (
                    <div
                      key={post._id}
                      className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer ${
                        index === 0 ? 'md:col-span-2' : ''
                      }`}
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      <div className={`relative ${index === 0 ? 'md:flex' : ''}`}>
                        <div className={`relative overflow-hidden ${
                          index === 0 ? 'md:w-1/2' : 'h-48'
                        }`}>
                          <img
                            src={post.coverImage || post.image || 'https://via.placeholder.com/600x400?text=Blog+Post'}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {post.featured && (
                            <span className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold">
                              Featured
                            </span>
                          )}
                          {post.trending && (
                            <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                              <TrendingUp size={12} />
                              Trending
                            </span>
                          )}
                        </div>
                        
                        <div className={`p-6 ${index === 0 ? 'md:w-1/2' : ''}`}>
                          {/* Categories */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.categories?.slice(0, 2).map((cat) => (
                              <span
                                key={cat}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>

                          {/* Title */}
                          <h2 className={`font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors ${
                            index === 0 ? 'text-2xl' : 'text-xl'
                          }`}>
                            {post.title}
                          </h2>

                          {/* Excerpt */}
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {post.excerpt || post.content?.substring(0, 150)}...
                          </p>

                          {/* Meta Info */}
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(post.createdAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              {calculateReadTime(post.content)} min read
                            </div>
                          </div>

                          {/* Author & Stats */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-gray-600">
                                  {post.author?.name?.charAt(0) || 'A'}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {post.author?.name || 'Anonymous'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-sm">
                                <Eye size={14} />
                                {post.views || 0}
                              </span>
                              <span className="flex items-center gap-1 text-sm">
                                <Heart size={14} />
                                {post.likes || 0}
                              </span>
                              <span className="flex items-center gap-1 text-sm">
                                <MessageCircle size={14} />
                                {post.comments || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`w-10 h-10 rounded-lg font-medium ${
                            currentPage === i + 1
                              ? 'bg-blue-600 text-white'
                              : 'border hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <div className="mb-4">
                  <Search size={48} className="mx-auto text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? `No results found for "${searchQuery}"` 
                    : "No blog posts available in this category"}
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            {/* Mobile Filters */}
            <div className={`lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity ${
              showFilters ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}>
              <div className={`absolute right-0 top-0 h-full w-80 bg-white transform transition-transform ${
                showFilters ? 'translate-x-0' : 'translate-x-full'
              }`}>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Filters</h3>
                    <button onClick={() => setShowFilters(false)}>
                      <X size={20} />
                    </button>
                  </div>
                  <SidebarContent
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                    popularPosts={popularPosts}
                    stats={stats}
                  />
                </div>
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block space-y-6">
              <SidebarContent
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                popularPosts={popularPosts}
                stats={stats}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sidebar Content Component
const SidebarContent = ({ categories, selectedCategory, onCategoryChange, popularPosts, stats }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Categories */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-lg mb-4">Categories</h3>
        <div className="space-y-2">
          <button
            onClick={() => onCategoryChange('all')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => onCategoryChange(category.name)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === category.name
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <span>{category.name}</span>
              <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Posts */}
      {popularPosts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-lg mb-4">Popular Posts</h3>
          <div className="space-y-4">
            {popularPosts.map((post) => (
              <div
                key={post._id}
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="flex gap-3 cursor-pointer group"
              >
                <div className="w-16 h-16 flex-shrink-0">
                  <img
                    src={post.coverImage || 'https://via.placeholder.com/64'}
                    alt={post.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Eye size={12} />
                    {post.views || 0} views
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-sm p-6 text-white">
        <h3 className="font-bold text-lg mb-2">Subscribe to Newsletter</h3>
        <p className="text-sm opacity-90 mb-4">
          Get the latest posts delivered straight to your inbox
        </p>
        <form className="space-y-3">
          <input
            type="email"
            placeholder="Your email address"
            className="w-full px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            type="submit"
            className="w-full bg-white text-blue-600 font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-lg mb-4">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {['Fashion', 'Style', 'Trends', 'Shopping', 'Tips', 'Guides', 'Reviews'].map((tag) => (
            <button
              key={tag}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default BlogPage;
