import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LogoLoader from "../components/LogoLoader";

const API_URL = import.meta.env.VITE_API_URL;

const DealsPage = () => {
  const [products, setProducts] = useState([]);
  const [cartProductIds, setCartProductIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/images/featured/images`
        );
        const data = await res.json();

        setProducts(data?.data?.images || []);
      } catch (err) {
        console.error("Failed to load deals", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        const items = data?.data?.items || [];

        setCartProductIds(items.map((i) => i.productId));
      } catch (err) {
        console.error("Failed to fetch cart", err);
      }
    };

    fetchCart();
  }, [token]);

  
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
          size: item.sizes,
          // image: item.signedUrl || item.url,
           image: item.images?.[0]?.url || item.url,
          qty: 1,
        }),
      });
      

      if (!res.ok) throw new Error();

      setCartProductIds((prev) => [...prev, item._id]);
      toast.success("Added to cart");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  
 const handleBuyNow = async (item) => {
  if (!token) {
    toast.info("Please login to continue");
    navigate("/login");
    return;
  }
  console.log("ite",item.sizes)

  // Navigate directly with product data
  navigate("/checkout", {
    state: {
      directProduct: {
        productId: item._id,
        name: item.name,
        sizes:item.sizes,
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
    <div className="container mx-auto px-4 py-12">
      
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2">
          🔥 Hot Deals
        </h1>
        <p className="text-gray-600">
          Limited time offers you don’t want to miss
        </p>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((item) => {
          const isInCart = cartProductIds.includes(item._id);

          return (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col relative"
            >
              {/* Deal Badge */}
              <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                DEAL
              </span>

              <img
                src={item.images?.[0]?.url || item.url}
                alt={item.name}
                className="w-full h-56 object-cover rounded-t-xl cursor-pointer"
                onClick={() => navigate(`/product/${item._id}`)}
              />

              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold truncate">
                  {item.name}
                </h3>

              <p className="text-sm text-gray-500 capitalize">
 Available Size: {item.sizes?.join(", ")}
</p>


                <p className="font-bold mt-1 text-red-600">
                  ₹{item.price}
                </p>

                {/* Buttons */}
                <div className="mt-auto flex gap-2 pt-4">
                  <button
                    disabled={isInCart}
                    onClick={() => handleAddToCart(item)}
                    className={`flex-1 py-2 rounded-lg transition
                      ${
                        isInCart
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "border border-gray-800 hover:bg-gray-800 hover:text-white"
                      }
                    `}
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

        {products.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No deals available right now
          </p>
        )}
      </div>
    </div>
  );
};

export default DealsPage;
