import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryItems = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_URL}/api/images/category/${category}`
        );

        const data = await res.json();

        const images = Array.isArray(data?.data?.images)
          ? data.data.images
          : [];

        setItems(images);
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryItems();
  }, [category]);

const handleAddToCart = async (item) => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 🔥 THIS is mandatory
      },
      body: JSON.stringify({
        productId: item._id,
        name: item.name,
        price: item.price,
        size: item.size,
        image: item.signedUrl || item.url,
        qty: 1,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to add to cart");
    }

    const data = await res.json();
    console.log("Added to cart:", data);
    navigate("/cart");
  } catch (err) {
    console.error("Add to cart failed", err);
    navigate("/login");
  }
};


const handleBuyNow = async (item) => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
    return;
  }

  const payload = {
    productId: item._id,
    name: item.name,
    price: item.price,
    size: item.size,
    image: item.signedUrl || item.url,
    qty: 1,
  };

  try {
    const res = await fetch(`${API_URL}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Buy now failed");
    }

    navigate("/checkout");
  } catch (err) {
    console.error("Buy now error:", err);
    alert("Please login to continue");
    navigate("/login");
  }
};



  if (loading) {
    return <div className="p-20 text-center">Loading {category}...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 capitalize">
        {category}
      </h1>

      {items.length === 0 ? (
        <p>No items found in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col"
            >
              <img
                src={item.signedUrl || item.url}
                alt={item.name}
                className="w-full h-56 object-cover rounded-lg mb-3"
              />

              <h3 className="font-semibold text-gray-900">
                {item.name}
              </h3>

              <p className="text-sm text-gray-500 capitalize">
                Size: {item.size}
              </p>

              <p className="text-lg font-bold text-gray-900 mt-1">
                ₹{item.price}
              </p>

              <div className="mt-auto flex gap-2 pt-4">
                <button
                  onClick={() => handleAddToCart(item)}
                  className="flex-1 border border-gray-800 text-gray-800 py-2 rounded-lg hover:bg-gray-800 hover:text-white transition"
                >
                  Add to Cart
                </button>

                <button
                  onClick={() => handleBuyNow(item)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
