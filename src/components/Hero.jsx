import React from 'react';
import { ChevronRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
              🎉 Summer Sale 2026
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Discover Your
              <span className="block text-blue-600">Perfect Style</span>
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-xl">
              Shop the latest collection of premium shirts, jeans, and accessories.
              Get up to 60% off on new arrivals. Free shipping on all orders.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center">
                Shop Now
                <ChevronRight className="ml-2" size={20} />
              </button>
              <button className="border-2 border-gray-800 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 hover:text-white">
                Explore Collections
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">10K+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-gray-600">Brand Partners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">24/7</div>
                <div className="text-gray-600">Customer Support</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800"
                alt="Fashion Collection"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl z-20">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg">
                  <span className="text-2xl">🔥</span>
                </div>
                <div className="ml-3">
                  <div className="font-bold">Trending Now</div>
                  <div className="text-sm text-gray-600">Oversized T-Shirts</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-xl z-20">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">60% OFF</div>
                <div className="text-sm text-gray-600">Summer Collection</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;