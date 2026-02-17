import React, { useEffect, useState } from "react";
import { Star, Heart, ShoppingBag, Eye } from "lucide-react";
import ProductCard from "./ProductCard";
import LogoLoader from "./LogoLoader";

const API_URL = import.meta.env.VITE_API_URL;

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchFeatured = async () => {
    try {
      const res = await fetch(`${API_URL}/api/images/featured/images`);
      const result = await res.json(); 


      if (result.success && result.data && result.data.images) {
        const mapped = result.data.images.map((item) => ({
          id: item._id,
          name: item.name,
          category: item.category,
          images: item?.images?.[0]?.url ||item.url,
          price: item.price || 0, 
          originalPrice: 69.99,
          rating: 4.7,
          reviews: 120,
          colors: ["bg-gray-800", "bg-white border"],
          sizes: ["S", "M", "L", "XL"],
          isNew: isNewProduct(item.createdAt),
          isSale: true,
        }));
        
        setProducts(mapped);
      } else {
        console.log("No featured images or wrong response structure");
        setProducts([]); // Set empty array if no images
      }
    } catch (err) {
      console.error("Failed to fetch featured products", err);
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  fetchFeatured();
}, []);

const isNewProduct = (createdAt) => {
  if (!createdAt) return false;
  
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
  
  return diffInDays <= 7; 
};

  if (loading) {
    return <div className="text-center py-20">
      <LogoLoader />
    </div>;
  }


return (
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Featured Products
        </h2>
        <p className="text-gray-600">
          Discover our handpicked collection
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No featured products available</p>
          <p className="text-sm text-gray-500 mt-1">
            Check back soon for new arrivals!
          </p>
        </div>
      )}
    </div>
  </section>
);
};

export default FeaturedProducts;
