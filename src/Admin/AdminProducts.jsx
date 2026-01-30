import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/images/latest/images`);
        const result = await res.json();

        const list = Array.isArray(result?.data?.images)
          ? result.data.images
          : [];

        setProducts(list);
      } catch (err) {
        toast.error("Failed to load products");
      }
    };

    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const res = await fetch(`${API_URL}/api/images/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      <div className="grid grid-cols-4 gap-6">
        {products.map((p) => (
          <div key={p._id} className="bg-white rounded-lg shadow p-3">
            <img
              src={p.url}
              alt={p.name}
              className="h-40 w-full object-cover rounded"
            />

            <h3 className="font-semibold mt-2">{p.name}</h3>
            <p className="text-sm text-gray-500 capitalize">
              {p.category}
            </p>
            <p className="font-bold">₹{p.price}</p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => navigate(`/admin/products/edit/${p._id}`)}
                className="flex-1 bg-blue-600 text-white py-1 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => deleteProduct(p._id)}
                className="flex-1 bg-red-600 text-white py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
