import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    price: "",
    size: "",
    category: "",
    isFeatured: false,
  });

 useEffect(() => {
  const fetchProduct = async () => {
    try {
      const res = await fetch(`${API_URL}/api/images/${id}`);
      const result = await res.json();

      // ✅ CORRECT extraction
      const image = result?.data?.image;

      if (!image) {
        throw new Error("Product not found");
      }

      // ✅ Auto-fill form
      setForm({
        name: image.name || "",
        price: image.price || "",
        size: image.size || "",
        category: image.category || "",
        isFeatured: image.isFeatured || false,
      });
    } catch (err) {
      console.error(err);
    }
  };

  fetchProduct();
}, [id]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/images/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      toast.success("Product updated");
      navigate("/admin/products");
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

      <form onSubmit={handleUpdate} className="space-y-4 bg-white p-5 rounded shadow">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product Name"
          className="w-full border p-2 rounded"
        />

        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full border p-2 rounded"
        />

        <input
          name="size"
          value={form.size}
          onChange={handleChange}
          placeholder="Size (S, M, L, XL)"
          className="w-full border p-2 rounded"
        />

        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Category"
          className="w-full border p-2 rounded"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isFeatured"
            checked={form.isFeatured}
            onChange={handleChange}
          />
          Featured product
        </label>

        <button className="bg-black text-white w-full py-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default AdminEditProduct;
