import React, { useEffect, useState } from 'react';
import { 
  Search, ShoppingCart, User, Menu, X, 
  ChevronDown, Heart, Bell
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [time, setTime] = useState(2 * 60 * 60 + 45 * 60 + 32); 
  
  const categories = [
    { name: 'Shirts', count: 42 },
    { name: 'T-Shirts', count: 56 },
    { name: 'Jeans', count: 38 },
    { name: 'Jackets', count: 24 },
    { name: 'Shoes', count: 67 },
    { name: 'Accessories', count: 29 },
  ];

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Deals', href: '/deals' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];


  useEffect(() => {
    if (time <= 0) return;

    const interval = setInterval(() => {
      setTime((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [time]);

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="hidden md:flex justify-between items-center py-2 border-b text-sm">
          <div className="flex items-center space-x-4">
            <span>🛒 Free shipping on orders over ₹500</span>
            <span className="text-green-600 font-semibold">Hot Sale: Up to 50% OFF</span>
          </div>
          <div className="flex items-center space-x-6">

            <select className="bg-transparent border-none focus:outline-none">
              <option>English</option>
              <option>Tamil</option>
              <option>Hindi</option>
            </select>
            <a href="/track-order" className="hover:text-blue-600">Track Order</a>
            <a href="/help" className="hover:text-blue-600">Help Center</a>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              className="md:hidden mr-4"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <a href="/" className="text-2xl font-bold text-blue-600">
              Style<span className="text-gray-800">Hub</span>
            </a>
          </div>

          {/* Categories Dropdown */}
          <div className="relative hidden lg:block">
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              <Menu size={20} />
              <span>All Categories</span>
              <ChevronDown size={16} />
            </button>
            
            {isCategoryOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-2xl rounded-lg p-4 z-50">
                {categories.map((category) => (
                  <a
                    key={category.name}
                    href={`/category/${category.name.toLowerCase()}`}
                    className="flex items-center justify-between py-2 px-3 hover:bg-gray-100 rounded-md"
                  >
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {category.count}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for shirts, jeans, shoes..."
                className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <button className="absolute right-2 top-2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700">
                Search
              </button>
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-6">
            <button className="relative hidden md:block">
              <User size={24} className="text-gray-700 hover:text-blue-600" />
            </button>
            <button className="relative hidden md:block">
              <Heart size={24} className="text-gray-700 hover:text-red-600" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>
            <button className="relative">
              <ShoppingCart size={24} className="text-gray-700 hover:text-blue-600" />
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                5
              </span>
            </button>
            <button className="md:hidden">
              <Search size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg rounded-lg p-4 mb-4">
            <div className="space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block py-2 px-3 hover:bg-gray-100 rounded-md font-medium"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 border-t">
                <h3 className="font-bold mb-2">Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <a
                      key={category.name}
                      href={`/category/${category.name.toLowerCase()}`}
                      className="text-sm py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      {category.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="hidden md:flex items-center justify-between py-3 border-t">
          <div className="flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-medium hover:text-blue-600"
              >
                {link.name}
              </a>
            ))}
          </div>
         <div className="flex items-center space-x-4">
      <span className="text-green-600 font-semibold flex items-center">
        <Bell size={16} className="mr-1" />
        Flash Sale: Ends in{" "}
        {String(hours).padStart(2, "0")}:
        {String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </span>
    </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;