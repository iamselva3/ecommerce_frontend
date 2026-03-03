import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import LogoLoader from "./LogoLoader";


const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/images/categories/list`);
        const data = await res.json();
        setCategories(data.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="text-center py-20">
      <LogoLoader />
    </div>;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-gray-600 mt-2">
              Browse through our wide range of products
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {categories.map((category) => (
           <Link
            key={category._id || category.id || category.name}
  to={`/category/${category.slug || category.name.toLowerCase()}`}
  className="group relative overflow-hidden rounded-2xl bg-gray-50 p-6 hover:shadow-xl transition-all"
>
                {/* <img src={category.url} alt={category.name} /> */}
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {category.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {category.count} items
              </p>

              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="inline-flex items-center text-sm text-blue-600">
                  Shop Now
                  <ArrowRight className="ml-1" size={14} />
                </span>
              </div>

              <div className="absolute bottom-0 right-0 w-24 h-24 overflow-hidden rounded-bl-2xl">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover opacity-20"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
