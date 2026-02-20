import React from 'react';
import { 
  Mail, Phone, MapPin, Facebook, Twitter, Instagram, 
  Youtube, Linkedin, Send, CreditCard, Shield, Truck,
  Clock, Heart, Award, ChevronRight
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Track Order', href: '/orders' },
    { name: 'Returns & Exchanges', href: '/returns' },
    { name: 'FAQs', href: '/help' },
    { name: 'Blog', href: '/blog' },
  ];

  const categories = [
    { name: "Men's Clothing", href: '/category/men' },
    { name: "Women's Clothing", href: '/category/women' },
    { name: "Kids' Collection", href: '/category/kids' },
    { name: 'Footwear', href: '/category/footwear' },
    { name: 'Accessories', href: '/category/accessories' },
    { name: 'Sale Items', href: '/deals' },
  ];

  const customerService = [
    { name: 'My Account', href: '/profile' },
    { name: 'Order History', href: '/orders' },
    { name: 'Wishlist', href: '/wishlist' },
    { name: 'Newsletter', href: '#newsletter' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Privacy Policy', href: '/privacy' },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', color: 'hover:text-blue-600' },
    { icon: Twitter, href: 'https://twitter.com', color: 'hover:text-blue-400' },
    { icon: Instagram, href: 'https://instagram.com', color: 'hover:text-pink-600' },
    { icon: Youtube, href: 'https://youtube.com', color: 'hover:text-red-600' },
    { icon: Linkedin, href: 'https://linkedin.com', color: 'hover:text-blue-700' },
  ];

  const paymentIcons = [
    { name: 'Visa', icon: '💳' },
    { name: 'Mastercard', icon: '💳' },
    { name: 'RuPay', icon: '🏦' },
    { name: 'UPI', icon: '📱' },
    { name: 'PayPal', icon: '🅿️' },
  ];

  const features = [
    { icon: Truck, text: 'Free Shipping', subtext: 'On orders above ₹500' },
    { icon: Shield, text: 'Secure Payment', subtext: '100% secure transactions' },
    { icon: Clock, text: '24/7 Support', subtext: 'Dedicated customer support' },
    { icon: Heart, text: 'Easy Returns', subtext: '30-day return policy' },
  ];

  return (
    <footer className="bg-gray-700 text-gray-300">
      {/* Features Bar */}
      <div className="bg-gray-700 border-t border-black-900">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="bg-gray-700 p-2 rounded-lg">
                  <feature.icon size={20} className="text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{feature.text}</h4>
                  <p className="text-xs text-gray-400">{feature.subtext}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/Logo.png" alt="Nammcart" className="w-10 h-10" />
              <span className="text-2xl font-bold text-white">
                Namma<span className="text-blue-400">Cart</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Your one-stop destination for trendy fashion and accessories. 
              Quality products at affordable prices.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-blue-400" />
                <span>123 Fashion Street, Chennai - 600001</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={16} className="text-blue-400" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail size={16} className="text-blue-400" />
                <span>support@nammacart.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-all duration-300 ${social.color}`}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-blue-400"></span>
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-blue-400 transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-blue-400"></span>
              Categories
            </h3>
            <ul className="space-y-2">
              {categories.map((category, index) => (
                <li key={index}>
                  <a
                    href={category.href}
                    className="text-sm hover:text-blue-400 transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-blue-400"></span>
              Customer Service
            </h3>
            <ul className="space-y-2">
              {customerService.map((service, index) => (
                <li key={index}>
                  <a
                    href={service.href}
                    className="text-sm hover:text-blue-400 transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-blue-400"></span>
              Newsletter
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to get updates on new arrivals and exclusive offers.
            </p>
            
            <div className="flex flex-col space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full bg-gray-800 text-white text-sm px-4 py-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 p-1.5 rounded-lg hover:bg-blue-600 transition-colors">
                  <Send size={16} />
                </button>
              </div>
              
              {/* Payment Methods */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-white mb-2">We Accept</h4>
                <div className="flex flex-wrap gap-2">
                  {paymentIcons.map((payment, index) => (
                    <div
                      key={index}
                      className="bg-gray-800 px-3 py-2 rounded-lg text-sm flex items-center gap-1"
                      title={payment.name}
                    >
                      <span>{payment.icon}</span>
                      <span className="text-gray-400">{payment.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-2 mt-2">
                <Award size={16} className="text-blue-400" />
                <span className="text-xs text-gray-400">100% Authentic Products</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-black-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} NammaCart. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="/privacy" className="hover:text-blue-400 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-blue-400 transition-colors">
                Terms of Service
              </a>
              <a href="/sitemap" className="hover:text-blue-400 transition-colors">
                Sitemap
              </a>
            </div>
            <p className="text-xs text-gray-500">
              Made with ❤️ in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;