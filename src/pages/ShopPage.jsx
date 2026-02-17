import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LogoLoader from "../components/LogoLoader";

const API_URL = import.meta.env.VITE_API_URL;

const ShopPage = () => {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [cartProductIds, setCartProductIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const scrollRefs = useRef({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");


  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/images/categories/list`);
        const data = await res.json();

        if (!data.success) throw new Error();
        setCategories(data.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  
  useEffect(() => {
    if (categories.length === 0) return;

    const fetchProducts = async () => {
      try {
        const result = {};

        await Promise.all(
          categories.map(async (category) => {
            const res = await fetch(
              `${API_URL}/api/images/category/${category.slug}`
            );
            const data = await res.json();
            result[category.slug] = data?.data?.images || [];
          })
        );

        setProductsByCategory(result);
      } catch (err) {
        console.error("Product fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categories]);

    
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        const items = data?.data?.items || data?.items || [];
        setCartProductIds(items.map((i) => i.productId));
      } catch (err) {
        console.error(err);
      }
    };

    fetchCart();
  }, [token]);

 
  const scroll = (slug, dir) => {
    const el = scrollRefs.current[slug];
    if (!el) return;

    el.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

 
  const handleAddToCart = async (item) => {
    if (!token) {
      toast.info("Please login to continue");
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
           image: item.images?.[0]?.url || item.url,
          qty: 1,
        }),
      });

      if (!res.ok) throw new Error();

      setCartProductIds((prev) => [...prev, item._id]);
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
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
    return <div className="p-20 text-center">
      <LogoLoader />
    </div>;
  }


  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {categories.map((category) => (
        <section key={category.slug}>
          <h2 className="text-2xl font-bold mb-6 pl-14">
            {category.name}
          </h2>

          <div className="relative">
            <button
              onClick={() => scroll(category.slug, "left")}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2"
            >
              <ChevronLeft />
            </button>

            <button
              onClick={() => scroll(category.slug, "right")}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2"
            >
              <ChevronRight />
            </button>

            <div
              ref={(el) => (scrollRefs.current[category.slug] = el)}
              className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide px-14"
            >
              {productsByCategory[category.slug]?.map((item) => {
                const isInCart = cartProductIds.includes(item._id);

                return (
                  <div
                    key={item._id}
                    className="min-w-[220px] bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col"
                  >
                    <img
                      src={item?.images?.[0]?.url || item.url}
                      alt={item.name}
                      className="w-full h-56 object-cover rounded-t-xl cursor-pointer"
                      onClick={() => navigate(`/product/${item._id}`)}
                    />

                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold truncate">
                        {item.name}
                      </h3>

                      
                      <p className="text-sm text-gray-500 mt-1">
                        Available sizes:{" "}
                        <span className="uppercase font-medium">
                          {item.sizes?.join(", ")}
                        </span>
                      </p>

                      <p className="font-bold mt-2">
                        ₹{item.price}
                      </p>

                      <div className="mt-auto flex gap-2 pt-4">
                        <button
                          disabled={isInCart}
                          onClick={() => handleAddToCart(item)}
                          className={`flex-1 py-3 rounded-lg transition ${
                            isInCart
                              ? "bg-gray-300 cursor-not-allowed"
                              : "border hover:bg-black hover:text-white"
                          }`}
                        >
                          {isInCart ? "In Cart" : "Add to Cart"}
                        </button>

                        <button
                          onClick={() => handleBuyNow(item)}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {productsByCategory[category.slug]?.length === 0 && (
                <p className="text-gray-500">No products found</p>
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};

export default ShopPage;
