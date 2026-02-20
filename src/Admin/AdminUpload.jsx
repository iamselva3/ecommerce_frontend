import React, { useState } from "react";
import { toast } from "react-toastify";
import { X, Upload, Image as ImageIcon } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const AVAILABLE_SIZES = ["s", "m", "l", "xl", "xxl"];
const MAX_IMAGES = 10;

const AdminUpload = () => {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    sizes: [],
    isFeatured: false,
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);

 
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

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (form.images.length + files.length > MAX_IMAGES) {
      toast.error(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024;
      
      if (!isValidType) toast.error(`${file.name} is not an image`);
      if (!isValidSize) toast.error(`${file.name} exceeds 5MB`);
      
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    setForm(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
    
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setForm(prev => ({ ...prev, images: [] }));
    setImagePreviews([]);
  };

 
const handleSubmit = async (e) => {
  e.preventDefault();

  if (form.images.length === 0) {
    return toast.error("Please select at least one image");
  }
  
  if (!form.name) return toast.error("Product name is required");
  if (!form.price) return toast.error("Price is required");
  if (!form.category) return toast.error("Category is required");
  if (form.sizes.length === 0) {
    return toast.error("Select at least one size");
  }

  // Normalize category
  const category = form.category.toLowerCase().trim();

  const formData = new FormData();
  
  form.images.forEach((image) => {
    formData.append("images", image);
  });
  
  const metadata = {
    name: form.name,
    description: form.description,
    price: parseFloat(form.price),
    sizes: form.sizes,
    isFeatured: form.isFeatured,
  };
  
  formData.append("metadata", JSON.stringify(metadata));

  setLoading(true);

  try {
    const res = await fetch(
      `${API_URL}/api/images/upload-multiple/${category}`, // use normalized category
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
      throw new Error(result.message || result.error || "Upload failed");
    }

    toast.success(`${result.data?.uploaded || form.images.length} image(s) uploaded successfully`);

    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    
    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      sizes: [],
      isFeatured: false,
      images: [],
    });
    
    setImagePreviews([]);
    
  } catch (err) {
    toast.error(err.message);
  } finally {
    setLoading(false);
  }
};


  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload Product</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-5"
      >
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Product Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g., Classic White T-Shirt"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description (optional)</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Product description..."
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            rows="3"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-1">Price (₹) *</label>
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            placeholder="299"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        {/* Category - Simple Input Box */}
        <div>
          <label className="block text-sm font-medium mb-1">Category *</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="e.g., t-shirts, shoes, accessories"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter any category (will be validated by server)
          </p>
        </div>

        {/* Sizes */}
        <div>
          <label className="block text-sm font-medium mb-2">Available Sizes *</label>
          <div className="flex gap-2 flex-wrap">
            {AVAILABLE_SIZES.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => handleSizeToggle(s)}
                className={`px-4 py-2 border rounded uppercase font-medium transition-all ${
                  form.sizes.includes(s)
                    ? "bg-black text-white border-black"
                    : "bg-white hover:border-gray-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isFeatured"
            checked={form.isFeatured}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">Mark as Featured Product</span>
        </label>

        {/* Image Upload Area */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Product Images * (Max {MAX_IMAGES} images)
          </label>
          
          {imagePreviews.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  {imagePreviews.length} of {MAX_IMAGES} images selected
                </span>
                <button
                  type="button"
                  onClick={clearAllImages}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
                
                {imagePreviews.length < MAX_IMAGES && (
                  <label className="border-2 border-dashed rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                    <Upload size={20} className="text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Add More</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {imagePreviews.length === 0 && (
            <label className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
              <ImageIcon size={40} className="text-gray-400 mb-2" />
              <span className="text-gray-600 font-medium">Click to upload images</span>
              <span className="text-sm text-gray-500 mt-1">
                PNG, JPG, WEBP up to 5MB each (max {MAX_IMAGES} images)
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
              Uploading {form.images.length} image(s)...
            </span>
          ) : (
            `Upload Product${form.images.length > 1 ? ` (${form.images.length} images)` : ''}`
          )}
        </button>
      </form>
    </div>
  );
};

export default AdminUpload;