import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const AVAILABLE_SIZES = ["s", "m", "l", "xl", "xxl"];

const AdminUpload = () => {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    sizes: [],
    isFeatured: false,
    image: null,
  });

  /* =======================
     FETCH CATEGORIES
  ======================== */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/images/categories/list`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load categories");
        }

        setCategories(data.data);

        // set default category
        if (data.data.length > 0) {
          setForm((prev) => ({
            ...prev,
            category: data.data[0].slug,
          }));
        }
      } catch (err) {
        toast.error(err.message);
      }
    };

    fetchCategories();
  }, []);

  /* =======================
     HANDLERS
  ======================== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSizeToggle = (size) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleImageChange = (e) => {
    setForm((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  /* =======================
     SUBMIT
  ======================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.image) return toast.error("Please select an image");
    if (!form.name) return toast.error("Product name is required");
    if (!form.price) return toast.error("Price is required");
    if (!form.category) return toast.error("Category is required");
    if (form.sizes.length === 0)
      return toast.error("Select at least one size");

    const formData = new FormData();
    formData.append("image", form.image);
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("sizes", JSON.stringify(form.sizes));
    formData.append("isFeatured", form.isFeatured);

    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/images/upload/${form.category}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Upload failed");
      }

      toast.success("Product uploaded successfully");

      setForm({
        name: "",
        description: "",
        price: "",
        category: categories[0]?.slug || "",
        sizes: [],
        isFeatured: false,
        image: null,
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     UI
  ======================== */
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Upload Product</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-5"
      >
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product Name"
          className="w-full border p-2 rounded"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description (optional)"
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

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <div>
          <p className="font-semibold mb-2">Available Sizes</p>
          <div className="flex gap-3 flex-wrap">
            {AVAILABLE_SIZES.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => handleSizeToggle(s)}
                className={`px-3 py-1 border rounded uppercase ${
                  form.sizes.includes(s)
                    ? "bg-black text-white"
                    : "bg-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isFeatured"
            checked={form.isFeatured}
            onChange={handleChange}
          />
          <span>Mark as Featured</span>
        </label>

        <input type="file" accept="image/*" onChange={handleImageChange} />

        <button
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:opacity-90"
        >
          {loading ? "Uploading..." : "Upload Product"}
        </button>
      </form>
    </div>
  );
};

export default AdminUpload;
