import React, { useState } from 'react';
import { Star, Heart, ShoppingBag, Eye, Check } from 'lucide-react';

const ProductCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || 'bg-gray-800');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    // TODO: Call API to add/remove from wishlist
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Call API to add to cart
    console.log('Added to cart:', {
      productId: product.id,
      name: product.name,
      color: selectedColor,
      size: selectedSize,
      price: product.price
    });
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Open quick view modal
    console.log('Quick view:', product.id);
  };

  return (
    <div 
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.isNew && (
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            NEW
          </span>
        )}
        {product.isSale && (
          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            -30%
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={handleAddToWishlist}
        className="absolute top-3 right-3 z-10 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:bg-red-50"
      >
        <Heart 
          size={20} 
          className={`transition-colors duration-200 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
        />
      </button>

      {/* Product Image */}
      <div className="relative overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
          }}
        />
        
        {/* Quick View Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <button 
              onClick={handleQuickView}
              className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              <Eye size={18} />
              Quick View
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category & Name */}
        <div className="mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            {product.category}
          </span>
          <h3 className="font-semibold text-gray-900 mt-1 line-clamp-1 hover:text-blue-600 cursor-pointer">
            {product.name}
          </h3>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={`${i < Math.floor(product.rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center mb-4">
          <span className="text-xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through ml-2">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
          {product.isSale && (
            <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-1 rounded ml-2">
              SAVE ${(product.originalPrice - product.price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Colors */}
        <div className="mb-3">
          <div className="text-xs text-gray-600 mb-2">Color:</div>
          <div className="flex gap-2">
            {product.colors.map((color, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedColor(color);
                }}
                className={`w-6 h-6 rounded-full border-2 ${color.includes('border') ? '' : 'border-gray-300'} transition-transform duration-200 hover:scale-110 ${
                  selectedColor === color ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                }`}
                style={color.includes('bg-') ? {} : { backgroundColor: color }}
                title={`Color ${i + 1}`}
              >
                {selectedColor === color && (
                  <Check size={12} className="text-white mx-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="mb-4">
          <div className="text-xs text-gray-600 mb-2">Size:</div>
          <div className="flex gap-2 flex-wrap">
            {product.sizes.map((size, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedSize(size);
                }}
                className={`px-3 py-1.5 text-sm border rounded-md transition-all duration-200 ${
                  selectedSize === size
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-300 text-gray-700 hover:border-gray-900'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold flex items-center justify-center hover:bg-black transition-all duration-200 group/cart active:scale-[0.98]"
        >
          <ShoppingBag size={18} className="mr-2 group-hover/cart:animate-bounce" />
          Add to Cart
        </button>
      </div>

      {/* Stock Indicator */}
      {product.stock && product.stock < 10 && (
        <div className="absolute bottom-20 right-4 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
          Only {product.stock} left
        </div>
      )}
    </div>
  );
};

export default ProductCard;