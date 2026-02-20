import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  Save, ArrowLeft, Trash2, Upload, Image as ImageIcon, 
  Plus, X, Star, Package, Tag, DollarSign, Layers,
  Edit, Camera, RefreshCw
} from "lucide-react";
import LogoLoader from "../components/LogoLoader";

const API_URL = import.meta.env.VITE_API_URL;

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    price: "",
    originalPrice: "",
    description: "",
    sizes: [],
    colors: [],
    category: "",
    tags: [],
    stock: 10,
    isFeatured: false,
    isNew: false,
    isSale: false,
    images: [],
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newColor, setNewColor] = useState("#000000");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);

  // Available options
  const sizeOptions = ["xs", "s", "m", "l", "xl", "xxl", "xxxl"];

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/images/${id}`);
        const result = await res.json();

        const product = result?.data?.image || result?.data;

        if (!product) {
          throw new Error("Product not found");
        }

        setForm({
          name: product.name || "",
          price: product.price || "",
          originalPrice: product.originalPrice || "",
          description: product.description || "",
          sizes: product.sizes || [],
          colors: product.colors || [],
          category: product.category || "",
          tags: product.tags || [],
          stock: product.stock || 10,
          isFeatured: product.isFeatured || false,
          isNew: product.isNew || false,
          isSale: product.isSale || false,
          images: product.images || [],
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product");
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  // Clean up preview URLs
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Toggle size
  const toggleSize = (size) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  // Add color
  const addColor = () => {
    if (!form.colors.includes(newColor)) {
      setForm(prev => ({
        ...prev,
        colors: [...prev.colors, newColor]
      }));
    }
  };

  // Remove color
  const removeColor = (colorToRemove) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.filter(color => color !== colorToRemove)
    }));
  };

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  // Remove selected file
  const removeSelectedFile = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Mark image for deletion
  const markImageForDeletion = (imageId) => {
    setDeletedImages(prev => [...prev, imageId]);
    setForm(prev => ({
      ...prev,
      images: prev.images.filter(img => img._id !== imageId)
    }));
  };

  // Upload new images
  const uploadImages = async () => {
    if (selectedFiles.length === 0) return [];

    const uploadData = new FormData();
    selectedFiles.forEach(file => {
      uploadData.append("images", file);
    });

    try {
      setUploading(true);
      const res = await fetch(`${API_URL}/api/images/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      if (!res.ok) throw new Error("Upload failed");
      
      const data = await res.json();
      return data.data?.images || [];
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload images");
      return [];
    } finally {
      setUploading(false);
    }
  };

  // Delete marked images
  const deleteMarkedImages = async () => {
    if (deletedImages.length === 0) return;

    try {
      await Promise.all(
        deletedImages.map(imageId =>
          fetch(`${API_URL}/api/images/${imageId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );
    } catch (err) {
      console.error("Error deleting images:", err);
    }
  };

  // Update product
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Upload new images first
      const uploadedImages = await uploadImages();
      
      // Delete removed images
      await deleteMarkedImages();

      // Prepare final images array
      const finalImages = [
        ...form.images,
        ...uploadedImages
      ];

      // Prepare update data
      const updateData = {
        ...form,
        images: finalImages,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
        stock: parseInt(form.stock),
      };

      const res = await fetch(`${API_URL}/api/images/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      toast.success("Product updated successfully");
      navigate("/admin/products");
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {/* <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div> */}
          <p className="mt-4 text-gray-600">
            <LogoLoader />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/products")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              form.isFeatured 
                ? "bg-yellow-100 text-yellow-700" 
                : "bg-gray-100 text-gray-600"
            }`}>
              {form.isFeatured ? "Featured" : "Not Featured"}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              ID: {id?.slice(-6)}
            </span>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package size={20} className="text-gray-500" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Classic White T-Shirt"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. men, women, kids"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-gray-500" />
              Pricing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="999"
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Price (₹)
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={form.originalPrice}
                  onChange={handleChange}
                  placeholder="1299"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Edit size={20} className="text-gray-500" />
              Description
            </h2>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Product description..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sizes */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Layers size={20} className="text-gray-500" />
              Available Sizes
            </h2>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 border-2 rounded-lg font-medium uppercase transition-all ${
                    form.sizes.includes(size)
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-gray-400 text-gray-700"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Camera size={20} className="text-gray-500" />
              Colors
            </h2>
            
            {/* Color List */}
            <div className="flex flex-wrap gap-3 mb-4">
              {form.colors.map((color, index) => (
                <div
                  key={index}
                  className="relative group"
                >
                  <div
                    className="w-12 h-12 rounded-full border-2 border-gray-300 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <button
                    type="button"
                    onClick={() => removeColor(color)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Color */}
            <div className="flex gap-2">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-12 h-12 p-1 border border-gray-300 rounded"
              />
              <button
                type="button"
                onClick={addColor}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Add Color
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Tag size={20} className="text-gray-500" />
              Tags
            </h2>

            {/* Tag List */}
            <div className="flex flex-wrap gap-2 mb-4">
              {form.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>

            {/* Add Tag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon size={20} className="text-gray-500" />
              Product Images
            </h2>

            {/* Existing Images */}
            {form.images.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Current Images</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {form.images.map((img, index) => (
                    <div key={img._id || index} className="relative group">
                      <img
                        src={img.url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => markImageForDeletion(img._id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Preview */}
            {previewUrls.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">New Images</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                id="imageUpload"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="imageUpload"
                className="cursor-pointer inline-flex flex-col items-center gap-2"
              >
                <Upload size={32} className="text-gray-400" />
                <span className="text-gray-600 font-medium">
                  Click to upload new images
                </span>
                <span className="text-sm text-gray-500">
                  PNG, JPG, GIF up to 10MB each
                </span>
              </label>
            </div>
          </div>

          {/* Flags */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star size={20} className="text-gray-500" />
              Product Flags
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600"
                />
                <div>
                  <p className="font-medium">Featured Product</p>
                  <p className="text-sm text-gray-500">
                    Show this product in featured sections
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  name="isNew"
                  checked={form.isNew}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600"
                />
                <div>
                  <p className="font-medium">New Arrival</p>
                  <p className="text-sm text-gray-500">
                    Mark as newly added product
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  name="isSale"
                  checked={form.isSale}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600"
                />
                <div>
                  <p className="font-medium">On Sale</p>
                  <p className="text-sm text-gray-500">
                    Show sale badge on product
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving || uploading ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  {uploading ? "Uploading..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditProduct;