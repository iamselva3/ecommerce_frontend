import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingBag, Check } from "lucide-react";
import { toast } from "react-toastify";
import LogoLoader from "../components/LogoLoader";

const API_URL = import.meta.env.VITE_API_URL;

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartProductIds, setCartProductIds] = useState({});
  const [cartLoading, setCartLoading] = useState({});

  const scrollRef = useRef(null);


 const formatSizes = (sizes, category) => {
  if (!sizes) return "";

  const isShoe = category?.toLowerCase() === "shoes";

  const shoeSizeMap = {
    xs: "6",
    s: "7",
    m: "8",
    l: "9",
    xl: "10",
    xxl: "11",
  };

  return sizes
    .map((size) => {
      const normalized = String(size).toLowerCase();

      if (isShoe) {
        return shoeSizeMap[normalized] || size;
      } else {
        return normalized.toUpperCase();
      }
    })
    .join(", ");
};


  // Fetch cart items
  const fetchCartItems = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      const items = data?.data?.items || data?.items || [];
      
      // Create a map of product IDs that are in cart
      const cartMap = {};
      items.forEach(item => {
        cartMap[item.productId] = true;
      });
      
      setCartProductIds(cartMap);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchCategoryItems = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_URL}/api/images/category/${category}`
        );
        const data = await res.json();

        const fetchedItems = Array.isArray(data?.data?.images) ? data.data.images : [];
        setItems(fetchedItems);
        
        // After items are loaded, fetch cart status
        await fetchCartItems();
        
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryItems();
  }, [category, token]);

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

    // Set loading for this specific item
    setCartLoading(prev => ({ ...prev, [item._id]: true }));

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
          image: item?.images?.[0]?.url || item.url,
          qty: 1,
        }),
      });

      if (!res.ok) throw new Error();
      
      // Update cart status for this item
      setCartProductIds(prev => ({ ...prev, [item._id]: true }));
      toast.success("Added to cart");
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart");
    } finally {
      setCartLoading(prev => ({ ...prev, [item._id]: false }));
    }
  };

  const handleBuyNow = async (item) => {
    if (!token) {
      toast.info("Please login to continue");
      navigate("/login");
      return;
    }

    navigate("/checkout", {
      state: {
        directProduct: {
          productId: item._id,
          name: item.name,
          price: item.price,
          sizes:item.sizes,
          image: item?.images?.[0]?.url || item.url,
          qty: 1
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="p-20 text-center">
        <LogoLoader />
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
            {items.map((item) => {
              const isInCart = cartProductIds[item._id];
              const isLoading = cartLoading[item._id];
              
              return (
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
         Available Sizes: {formatSizes(item.sizes, category)}
                  </p>

                  <p className="text-lg font-bold mt-1">
                    ₹{item.price}
                  </p>

                  <div className="mt-auto flex gap-2 pt-4">
                    {isInCart ? (
                      <button
                        disabled
                        className="flex-1 bg-gray-400 text-black py-2 rounded-lg flex items-center justify-center gap-2 cursor-default"
                      >
                        {/* <Check size={18} /> */}
                        In Cart
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={isLoading}
                        className={`flex-1 border py-2 rounded-lg hover:bg-black hover:text-white transition flex items-center justify-center gap-2 ${
                          isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                            Adding...
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={16} />
                            Add to Cart
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => handleBuyNow(item)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;