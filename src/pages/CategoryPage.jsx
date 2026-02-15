import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();

   const token = localStorage.getItem("token");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef(null);

  
  useEffect(() => {
    const fetchCategoryItems = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_URL}/api/images/category/${category}`
        );
        const data = await res.json();

        setItems(Array.isArray(data?.data?.images) ? data.data.images : []);
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryItems();
  }, [category]);

  const scroll = (dir) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

 
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item._id,
          name: item.name,
          price: item.price,
          sizes: item.sizes,
          // image: item.signedUrl || item.url,
           image: item?.images?.[0]?.url || item.url,

          qty: 1,
        }),
      });

      if (!res.ok) throw new Error();
      navigate("/cart");
    } catch (err) {
      console.error(err);
      navigate("/login");
    }
  };

 const handleBuyNow = async (item) => {
  if (!token) {
    toast.info("Please login to continue");
    navigate("/login");
    return;
  }

  // Navigate directly with product data
  navigate("/checkout", {
    state: {
      directProduct: {
        productId: item._id,
        name: item.name,
        price: item.price,
        // image: item.signedUrl || item.url,
        image: item?.images?.[0]?.url || item.url,
        qty: 1
      }
    }
  });
};

  if (loading) {
    return (
      <div className="p-20 text-center">
        Loading {category}...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 capitalize pl-14">
        {category}
      </h1>

      {items.length === 0 ? (
        <p>No items found in this category.</p>
      ) : (
        <div className="relative">
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2"
          >
            <ChevronRight />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide px-14"
          >
            {items.map((item) => (
              <div
                key={item._id}
                className="min-w-[240px] bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col"
              >
                <img
                  src={item?.images?.[0]?.url || item?.images?.[0]?.url}
                  alt={item.name}
                  className="w-full h-56 object-cover rounded-lg mb-3 cursor-pointer"
                  onClick={() => navigate(`/product/${item._id}`)}
                />

                <h3 className="font-semibold truncate">
                  {item.name}
                </h3>

                <p className="text-sm text-gray-500">
                  Size: {item.sizes?.join(", ").toUpperCase()}
                </p>

                <p className="text-lg font-bold mt-1">
                  ₹{item.price}
                </p>

                <div className="mt-auto flex gap-2 pt-4">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 border py-2 rounded-lg hover:bg-black hover:text-white transition"
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
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
