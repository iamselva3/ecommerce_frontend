import React from 'react';
import { 
  Truck, Package, Clock, MapPin, IndianRupee,
  CheckCircle, XCircle, AlertCircle, Globe,
  Mail, Phone, HelpCircle, Shield, CreditCard,
  Calendar, Home, Navigation
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ShippingInfo = () => {
  const lastUpdated = "March 1, 2026";

  const shippingMethods = [
    {
      name: "Standard Delivery",
      icon: <Truck className="w-6 h-6" />,
      time: "3-5 Business Days",
      cost: "₹40",
      free: "Free on orders above ₹500",
      description: "Reliable and economical delivery for all orders"
    },
    {
      name: "Express Delivery",
      icon: <Clock className="w-6 h-6" />,
      time: "1-2 Business Days",
      cost: "₹99",
      free: "Not available for free",
      description: "Get your orders faster with priority processing"
    },
    {
      name: "Same Day Delivery",
      icon: <Calendar className="w-6 h-6" />,
      time: "Within 24 hours",
      cost: "₹149",
      free: "Not available for free",
      description: "Order before 12 PM for same-day delivery (select cities only)"
    },
    {
      name: "Cash on Delivery",
      icon: <IndianRupee className="w-6 h-6" />,
      time: "Same as standard",
      cost: "₹50 extra",
      free: "Not available for free",
      description: "Pay when you receive your order"
    }
  ];

  const shippingZones = [
    {
      zone: "Zone 1 - Metro Cities",
      cities: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"],
      delivery: "1-3 days",
      cod: "Available"
    },
    {
      zone: "Zone 2 - Major Cities",
      cities: ["Lucknow", "Jaipur", "Nagpur", "Indore", "Bhopal", "Patna", "Chandigarh", "Bhubaneswar"],
      delivery: "3-5 days",
      cod: "Available"
    },
    {
      zone: "Zone 3 - Tier 2 Cities",
      cities: ["All district headquarters and major towns"],
      delivery: "4-6 days",
      cod: "Available"
    },
    {
      zone: "Zone 4 - Remote Areas",
      cities: ["Villages and remote locations"],
      delivery: "5-7 days",
      cod: "Limited availability"
    }
  ];

  const restrictions = [
    {
      title: "Pincodes Not Serviceable",
      items: [
        "Some remote areas in North-East India",
        "Certain military areas (with restricted access)",
        "Andaman & Nicobar Islands (limited service)",
        "Lakshadweep Islands (limited service)",
        "Some villages in Jammu & Kashmir"
      ]
    },
    {
      title: "Product Restrictions",
      items: [
        "Hazardous materials cannot be shipped",
        "Liquor and tobacco products restricted",
        "Perishable items (limited to express delivery)",
        "Heavy items (above 20kg) have additional charges",
        "High-value items require signature on delivery"
      ]
    }
  ];

  const trackingSteps = [
    {
      step: "Order Placed",
      description: "You'll receive an order confirmation email with order details"
    },
    {
      step: "Order Confirmed",
      description: "Seller confirms availability and processes your order"
    },
    {
      step: "Shipped",
      description: "Order is packed and handed over to our courier partner"
    },
    {
      step: "In Transit",
      description: "Package is on its way to your location"
    },
    {
      step: "Out for Delivery",
      description: "Package is with the delivery agent for final delivery"
    },
    {
      step: "Delivered",
      description: "Package successfully delivered to you"
    }
  ];

  const faqs = [
    {
      question: "How can I track my order?",
      answer: "You can track your order in the 'My Orders' section of your account. You'll also receive SMS and email updates at each stage of delivery."
    },
    {
      question: "What if I'm not home for delivery?",
      answer: "The delivery agent will attempt delivery 3 times. If all attempts fail, the package will be returned to seller. You can also request to reschedule delivery."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we only ship within India. International shipping will be available soon."
    },
    {
      question: "Can I change my delivery address after ordering?",
      answer: "Yes, you can change your address within 2 hours of placing the order. After that, it depends on the shipment status."
    },
    {
      question: "What is Cash on Delivery (COD)?",
      answer: "COD allows you to pay cash at the time of delivery. Additional ₹50 fee applies. Maximum order value for COD is ₹10,000."
    },
    {
      question: "How are shipping charges calculated?",
      answer: "Shipping charges are based on order value, weight, and delivery location. They're calculated at checkout before payment."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      {/* <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Shipping Information</h1>
          </div>
          <p className="text-xl text-orange-100">Fast, reliable delivery across India</p>
          <p className="text-orange-200 mt-2">Last Updated: {lastUpdated}</p>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Free Shipping Banner */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4">
            <Truck className="w-12 h-12" />
            <div>
              <h2 className="text-2xl font-bold mb-2">🚚 Free Shipping on Orders Above ₹500</h2>
              <p className="text-green-100">No minimum order value for Prime members • Use code: FREESHIP</p>
            </div>
          </div>
        </div>

        {/* Shipping Methods */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Methods</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {shippingMethods.map((method, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-orange-600 mb-4">{method.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.name}</h3>
                <div className="space-y-2 mb-3">
                  <p className="text-sm text-gray-600">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {method.time}
                  </p>
                  <p className="text-sm text-gray-600">
                    <IndianRupee className="w-4 h-4 inline mr-1" />
                    {method.cost}
                  </p>
                </div>
                {method.free !== "Not available for free" && (
                  <p className="text-xs text-green-600 font-medium">{method.free}</p>
                )}
                <p className="text-xs text-gray-500 mt-3">{method.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Timeline */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Estimated Delivery Times
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Metro Cities</span>
                <span className="font-semibold text-green-600">1-3 days</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Major Cities</span>
                <span className="font-semibold text-green-600">3-5 days</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Tier 2 Cities</span>
                <span className="font-semibold text-orange-600">4-6 days</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Remote Areas</span>
                <span className="font-semibold text-red-600">5-7 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">North-East India</span>
                <span className="font-semibold text-orange-600">5-8 days</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" />
              Order Processing Time
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Standard Processing</p>
                  <p className="text-sm text-gray-600">Orders processed within 24 hours on business days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Express Processing</p>
                  <p className="text-sm text-gray-600">Orders processed within 6 hours (for express delivery)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Weekend Orders</p>
                  <p className="text-sm text-gray-600">Orders placed after Friday 2 PM processed on Monday</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Zones */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-orange-600" />
            Shipping Zones & Coverage
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {shippingZones.map((zone, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{zone.zone}</h3>
                <p className="text-xs text-gray-500 mb-2">{zone.cities}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="font-medium text-green-600">{zone.delivery}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">COD:</span>
                  <span className="font-medium text-blue-600">{zone.cod}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tracking Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Tracking Journey</h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {trackingSteps.map((step, index) => (
                <div key={index} className="text-center relative">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-orange-600 font-bold">{index + 1}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">{step.step}</h3>
                  <p className="text-xs text-gray-500">{step.description}</p>
                  {index < trackingSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-5 left-[60%] w-[80%] h-0.5 bg-gray-200"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Restrictions */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {restrictions.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                {index === 0 ? <XCircle className="w-5 h-5 text-red-600" /> : <AlertCircle className="w-5 h-5 text-orange-600" />}
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-orange-600" />
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-sm text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Important Shipping Notes
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Delivery times are estimates and may vary due to weather, holidays, or unforeseen circumstances</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>All shipments are fully insured against loss or damage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>You'll receive tracking details via SMS and email once your order ships</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>For COD orders, please keep exact change ready (delivery agents may not carry change)</span>
            </li>
          </ul>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Need Help With Your Delivery?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" />
              <div>
                <p className="text-sm opacity-90">Email</p>
                <a href="mailto:shipping@nammacart.com" className="font-medium hover:underline">
                  shipping@nammacart.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5" />
              <div>
                <p className="text-sm opacity-90">Phone</p>
                <a href="tel:+919876543210" className="font-medium hover:underline">
                  +91 98765 43210
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5" />
              <div>
                <p className="text-sm opacity-90">Support Hours</p>
                <p className="font-medium">24/7 Tracking • 9AM-9PM Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Track Order Button */}
        <div className="mt-8 text-center">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg"
          >
            <Package className="w-5 h-5" />
            Track Your Order
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;