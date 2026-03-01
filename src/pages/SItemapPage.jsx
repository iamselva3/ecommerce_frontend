import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, ShoppingBag, Tag, Info, Phone, 
  Shield, FileText, Map, User, Heart, 
  ShoppingCart, Package, HelpCircle, Mail,
  Facebook, Twitter, Instagram, Youtube
} from 'lucide-react';

const Sitemap = () => {
  const lastUpdated = "March 1, 2026";

  const sections = [
    {
      title: "Main Pages",
      icon: <Home className="w-5 h-5" />,
      links: [
        { name: "Home", path: "/", description: "Browse featured products and deals" },
        { name: "Shop", path: "/shop", description: "Explore all products" },
        { name: "Deals", path: "/deals", description: "Daily deals and offers" },
        { name: "New Arrivals", path: "/new-arrivals", description: "Latest products" },
        { name: "Best Sellers", path: "/best-sellers", description: "Most popular items" }
      ]
    },
    {
      title: "Categories",
      icon: <ShoppingBag className="w-5 h-5" />,
      links: [
        { name: "Men's Fashion", path: "/category/men", description: "Clothing, shoes, accessories" },
        { name: "Women's Fashion", path: "/category/women", description: "Dresses, handbags, jewelry" },
        { name: "Kids", path: "/category/kids", description: "Children's clothing and toys" },
        { name: "Electronics", path: "/category/electronics", description: "Gadgets and accessories" },
        { name: "Home & Living", path: "/category/home", description: "Furniture, decor, kitchen" },
        { name: "Beauty", path: "/category/beauty", description: "Cosmetics and skincare" },
        { name: "Sports", path: "/category/sports", description: "Fitness and outdoor gear" },
        { name: "Books", path: "/category/books", description: "Books and stationery" }
      ]
    },
    {
      title: "Account Pages",
      icon: <User className="w-5 h-5" />,
      links: [
        { name: "My Profile", path: "/profile", description: "View and edit profile" },
        { name: "My Orders", path: "/orders", description: "Track order history" },
        { name: "Wishlist", path: "/wishlist", description: "Saved items" },
        { name: "Cart", path: "/cart", description: "Shopping cart" },
        { name: "Checkout", path: "/checkout", description: "Complete purchase" }
      ]
    },
    {
      title: "Support",
      icon: <HelpCircle className="w-5 h-5" />,
      links: [
        { name: "About Us", path: "/about", description: "Our story and team" },
        { name: "Contact Us", path: "/contact", description: "Get in touch" },
        { name: "FAQ", path: "/faq", description: "Frequently asked questions" },
        { name: "Shipping Info", path: "/shipping", description: "Delivery policies" },
        { name: "Returns", path: "/returns", description: "Return and refund policy" },
        { name: "Size Guide", path: "/size-guide", description: "Find your size" }
      ]
    },
    {
      title: "Legal",
      icon: <Shield className="w-5 h-5" />,
      links: [
        { name: "Privacy Policy", path: "/privacy-policy", description: "How we handle your data" },
        { name: "Terms & Conditions", path: "/terms", description: "Terms of service" },
        { name: "Cookie Policy", path: "/cookies", description: "How we use cookies" },
        { name: "Disclaimer", path: "/disclaimer", description: "Legal disclaimer" }
      ]
    }
  ];

  const quickLinks = [
    { name: "Track Order", path: "/orders", icon: <Package className="w-4 h-4" /> },
    { name: "Help Center", path: "/help", icon: <HelpCircle className="w-4 h-4" /> },
    { name: "Contact Support", path: "/contact", icon: <Mail className="w-4 h-4" /> }
  ];

  const socialLinks = [
    { name: "Facebook", url: "https://facebook.com/nammacart", icon: <Facebook /> },
    { name: "Twitter", url: "https://twitter.com/nammacart", icon: <Twitter /> },
    { name: "Instagram", url: "https://instagram.com/nammacart", icon: <Instagram /> },
    { name: "YouTube", url: "https://youtube.com/nammacart", icon: <Youtube /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Map className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Sitemap</h1>
          </div>
          <p className="text-xl text-green-100">Last Updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="flex flex-wrap gap-4">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-green-600 hover:text-white transition-colors"
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Sitemap Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-green-600">{section.icon}</div>
                <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      to={link.path}
                      className="block group hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900 group-hover:text-green-600">
                        {link.name}
                      </div>
                      <div className="text-sm text-gray-500">{link.description}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* XML Sitemap */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Technical Sitemap</h2>
          <p className="text-gray-600 mb-4">
            For developers and SEO purposes, our XML sitemap is available at:
          </p>
          <div className="bg-gray-100 p-4 rounded-lg">
            <code className="text-sm text-gray-800 break-all">
              https://www.nammacart.com/sitemap.xml
            </code>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Connect With Us</h2>
          <div className="flex gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-green-600 hover:text-white transition-colors"
              >
                {social.icon}
                <span>{social.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">50+</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">10k+</div>
            <div className="text-sm text-gray-600">Products</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">15</div>
            <div className="text-sm text-gray-600">Information Pages</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">24/7</div>
            <div className="text-sm text-gray-600">Support</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;