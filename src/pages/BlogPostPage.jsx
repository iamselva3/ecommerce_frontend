import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Calendar, User, Tag, Clock, ArrowLeft, Heart,
  Share2, Bookmark, MessageCircle, Eye, ThumbsUp,
  Facebook, Twitter, Instagram, Linkedin, Link as LinkIcon,
  ChevronLeft, ChevronRight, Send, X
} from "lucide-react";
import LogoLoader from "../components/LogoLoader";

const API_URL = import.meta.env.VITE_API_URL;

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [commentPage, setCommentPage] = useState(1);
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/blog/posts/${slug}`);
      const data = await res.json();

      if (data.success) {
        setPost(data.data);
        setLikeCount(data.data.likes || 0);
        
        // Check if user liked this post
        if (token && data.data.likedBy?.includes(user._id)) {
          setLiked(true);
        }
        
        // Fetch comments
        fetchComments(data.data._id);
        
        // Fetch related posts
        fetchRelatedPosts(data.data.categories, data.data._id);
        
        // Increment view count
        incrementViewCount(data.data._id);
      } else {
        toast.error("Post not found");
        navigate("/blog");
      }
    } catch (err) {
      console.error("Error fetching post:", err);
      toast.error("Failed to load blog post");
      navigate("/blog");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId, page = 1) => {
    try {
      setLoadingComments(true);
      const res = await fetch(`${API_URL}/api/blog/comments/${postId}?page=${page}&limit=10`);
      const data = await res.json();
      
      if (data.success) {
        setComments(data.data.comments);
        setCommentPage(data.data.pagination.page);
        setCommentTotalPages(data.data.pagination.pages);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchRelatedPosts = async (categories, currentPostId) => {
    try {
      const category = categories?.[0] || '';
      const res = await fetch(`${API_URL}/api/blog/posts/category/${category}?limit=3&exclude=${currentPostId}`);
      const data = await res.json();
      
      if (data.success) {
        setRelatedPosts(data.data.posts || []);
      }
    } catch (err) {
      console.error("Error fetching related posts:", err);
    }
  };

  const incrementViewCount = async (postId) => {
    try {
      await fetch(`${API_URL}/api/blog/posts/${postId}/view`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Error incrementing view count:", err);
    }
  };

  const handleLike = async () => {
    if (!token) {
      toast.info("Please login to like posts");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/blog/posts/${post._id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
      }
    } catch (err) {
      toast.error("Failed to like post");
    }
  };

  const handleBookmark = async () => {
    if (!token) {
      toast.info("Please login to bookmark posts");
      navigate("/login");
      return;
    }

    try {
      const method = bookmarked ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/api/blog/bookmarks/${post._id}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setBookmarked(!bookmarked);
        toast.success(bookmarked ? "Removed from bookmarks" : "Added to bookmarks");
      }
    } catch (err) {
      toast.error("Failed to update bookmark");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt || `Check out this article on Nammacart Blog`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.info("Please login to comment");
      navigate("/login");
      return;
    }

    if (!commentText.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/blog/comments/${post._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: commentText,
          parentId: replyTo?._id
        }),
      });

      if (res.ok) {
        toast.success("Comment posted successfully");
        setCommentText("");
        setReplyTo(null);
        fetchComments(post._id, 1);
      } else {
        throw new Error("Failed to post comment");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(`${API_URL}/api/blog/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Comment deleted");
        fetchComments(post._id, 1);
      }
    } catch (err) {
      toast.error("Failed to delete comment");
    }
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

  const renderContent = (content) => {
    // Simple content rendering - you can enhance this with a markdown parser
    return content?.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4">{paragraph}</p>
    ));
  };

  const renderComments = (commentsList, level = 0) => {
    return commentsList.map((comment) => (
      <div key={comment._id} className={`${level > 0 ? 'ml-8 mt-4' : ''}`}>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {comment.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.user?.name || 'Anonymous'}</span>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 mt-1">{comment.content}</p>
                
                {/* Comment Actions */}
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => setReplyTo(comment)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Reply
                  </button>
                  {(user._id === comment.user?._id || user.role === 'admin') && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Render replies */}
        {comment.replies?.length > 0 && (
          <div className="mt-2">
            {renderComments(comment.replies, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LogoLoader />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <button
          onClick={() => navigate("/blog")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Blog
        </button>
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
              <Link to="/blog" className="hover:text-gray-900">Blog</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{post.title}</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <img
          src={post.coverImage || post.image || 'https://via.placeholder.com/1920x500?text=Blog+Post'}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Post Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl">
              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-3">
                {post.categories?.map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                  >
                    {cat}
                  </span>
                ))}
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {post.title}
              </h1>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {post.author?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <span>{post.author?.name || 'Anonymous'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  {formatDate(post.createdAt)}
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  {calculateReadTime(post.content)} min read
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              {/* Action Bar */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      liked
                        ? 'bg-red-50 text-red-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart size={20} className={liked ? 'fill-red-600' : ''} />
                    <span>{likeCount}</span>
                  </button>
                  
                  <button
                    onClick={handleBookmark}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      bookmarked
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Bookmark size={20} className={bookmarked ? 'fill-blue-600' : ''} />
                    <span>{bookmarked ? 'Saved' : 'Save'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Share"
                  >
                    <Share2 size={20} />
                  </button>
                  <div className="flex items-center gap-1">
                    <Eye size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{post.views || 0} views</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none mb-8">
                {renderContent(post.content)}
              </div>

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="border-t pt-6 mb-8">
                  <h3 className="font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/blog?tag=${tag}`}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-6">
                  Comments ({post.comments || 0})
                </h3>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  {replyTo && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-3 flex justify-between items-center">
                      <span className="text-sm">
                        Replying to <span className="font-semibold">{replyTo.user?.name}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setReplyTo(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={token ? "Write a comment..." : "Login to comment"}
                      rows="3"
                      disabled={!token}
                      className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                    <button
                      type="submit"
                      disabled={!token || !commentText.trim()}
                      className="px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                {loadingComments ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : comments.length > 0 ? (
                  <div className="space-y-4">
                    {renderComments(comments)}
                    
                    {/* Load More Comments */}
                    {commentPage < commentTotalPages && (
                      <div className="text-center mt-4">
                        <button
                          onClick={() => fetchComments(post._id, commentPage + 1)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Load More Comments
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 py-8">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            {/* Author Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="font-bold text-lg mb-4">About the Author</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold">
                    {post.author?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold">{post.author?.name || 'Anonymous'}</h4>
                  <p className="text-sm text-gray-600">{post.author?.role || 'Author'}</p>
                </div>
              </div>
              {post.author?.bio && (
                <p className="text-gray-700 text-sm">{post.author.bio}</p>
              )}
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4">Related Articles</h3>
                <div className="space-y-4">
                  {relatedPosts.map((related) => (
                    <div
                      key={related._id}
                      onClick={() => navigate(`/blog/${related.slug}`)}
                      className="flex gap-3 cursor-pointer group"
                    >
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={related.coverImage || 'https://via.placeholder.com/80'}
                          alt={related.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {related.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Calendar size={12} />
                          {formatDate(related.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share Options */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <h3 className="font-bold text-lg mb-4">Share this Article</h3>
              <div className="flex gap-3">
                <button className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Facebook size={20} />
                </button>
                <button className="p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
                  <Twitter size={20} />
                </button>
                <button className="p-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                  <Instagram size={20} />
                </button>
                <button className="p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors">
                  <Linkedin size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation between posts */}
        <div className="mt-8 flex justify-between">
          {post.previousPost && (
            <button
              onClick={() => navigate(`/blog/${post.previousPost.slug}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={20} />
              <div>
                <div className="text-sm">Previous</div>
                <div className="font-medium">{post.previousPost.title}</div>
              </div>
            </button>
          )}
          {post.nextPost && (
            <button
              onClick={() => navigate(`/blog/${post.nextPost.slug}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 ml-auto"
            >
              <div className="text-right">
                <div className="text-sm">Next</div>
                <div className="font-medium">{post.nextPost.title}</div>
              </div>
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;