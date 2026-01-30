import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const AdminFeatured = () => {
  const [items, setItems] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/api/images/featured/images`)
      .then((r) => r.json())
      .then((d) => setItems(d.data.images));
  }, []);

  const toggleFeatured = async (id) => {
    await fetch(`${API_URL}/api/images/${id}/toggle-featured`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    setItems((prev) =>
      prev.map((i) =>
        i._id === id ? { ...i, isFeatured: !i.isFeatured } : i
      )
    );

    toast.success("Updated");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Featured Products</h1>

      <div className="grid grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item._id} className="bg-white p-3 rounded shadow">
            <img src={item.url} className="h-32 w-full object-cover" />
            <p className="font-semibold">{item.name}</p>

            <button
              onClick={() => toggleFeatured(item._id)}
              className="mt-2 text-sm bg-blue-600 text-white px-2 py-1 rounded"
            >
              {item.isFeatured ? "Unfeature" : "Feature"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFeatured;
