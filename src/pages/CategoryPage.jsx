import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const CategoryPage = () => {
  const { category } = useParams(); // from URL
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);


useEffect(() => {
  const fetchCategoryItems = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/images/category/${category}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch category items");
      }

      const data = await res.json();

      // 🛡️ HARD GUARD
      const images = Array.isArray(data?.data?.images) ? data.data.images : [];

      setItems(images);
    } catch (err) {
      console.error("Failed to fetch category items", err);
      setItems([]); // always array
    } finally {
      setLoading(false);
    }
  };

  fetchCategoryItems();
}, [category]);


useEffect(() => {
  console.log("ITEMS UPDATED:", items);
}, [items]);





  if (loading) {
    return <div className="p-20 text-center">Loading {category}...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 capitalize">
        {category}
      </h1>

     {!items || items.length === 0 ? (
        <p>No items found in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-4"
            >
              <img
                src={item.url}
                alt={item.name}
                className="w-full h-56 object-cover rounded-lg mb-3"
              />
              <h3 className="font-semibold text-gray-900">
                {item.name}
              </h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
