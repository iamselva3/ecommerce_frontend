import React from 'react';
import { Shield, Lock, Eye, Globe, Mail, Phone, MapPin } from 'lucide-react';

const PrivacyPolicy = () => {
  const lastUpdated = "March 1, 2026";

  const sections = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Information We Collect",
      content: [
        "Personal Information: Name, email address, phone number, shipping address, billing address",
        "Payment Information: Credit/debit card details, UPI IDs, bank account details (processed securely through payment gateways)",
        "Account Credentials: Username, password, profile picture",
        "Order History: Products purchased, returns, exchanges, reviews",
        "Device Information: IP address, browser type, operating system, device identifiers",
        "Usage Data: Pages visited, time spent, clicks, search queries",
        "Location Information: General location based on IP address",
        "Cookies and Tracking Technologies: As described in our Cookie Policy"
      ]
    },
    {
      icon: <Eye className="w-6 w-6" />,
      title: "How We Use Your Information",
      content: [
        "Process and fulfill your orders",
        "Communicate about your orders and account",
        "Send promotional offers and newsletters (with consent)",
        "Improve our website and services",
        "Personalize your shopping experience",
        "Prevent fraud and enhance security",
        "Comply with legal obligations",
        "Analyze website performance and user behavior"
      ]
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Information Sharing",
      content: [
        "We do not sell your personal information to third parties",
        "We share information with:",
        "• Delivery partners for shipping",
        "• Payment processors for transactions",
        "• Service providers for website hosting and analytics",
        "• Law enforcement when required by law",
        "• Business partners with your consent"
      ]
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Your Rights",
      content: [
        "Access your personal information",
        "Correct inaccurate data",
        "Delete your account and data",
        "Opt-out of marketing communications",
        "Export your data",
        "Withdraw consent at any time",
        "Lodge a complaint with data protection authorities"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-blue-100">Last Updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Introduction */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy Matters</h2>
            <p className="text-gray-600 leading-relaxed">
              At NammaCart, we take your privacy seriously. This policy describes how we collect, 
              use, and protect your personal information when you use our website and services. 
              By using NammaCart, you agree to the collection and use of information in accordance 
              with this policy.
            </p>
          </div>

          {/* Sections Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {sections.map((section, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-blue-600">{section.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Cookie Policy */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Policy</h2>
            <div className="bg-blue-50 rounded-xl p-6">
              <p className="text-gray-700 mb-4">
                We use cookies and similar tracking technologies to track activity on our website 
                and hold certain information. Cookies are files with small amount of data which 
                may include an anonymous unique identifier.
              </p>
              <h3 className="font-semibold text-gray-900 mb-2">Types of cookies we use:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li><span className="font-medium">Essential cookies:</span> Required for website functionality</li>
                <li><span className="font-medium">Preference cookies:</span> Remember your settings</li>
                <li><span className="font-medium">Analytics cookies:</span> Understand how visitors use our site</li>
                <li><span className="font-medium">Marketing cookies:</span> Deliver personalized ads</li>
              </ul>
            </div>
          </div>

          {/* Data Security */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <div className="bg-green-50 rounded-xl p-6">
              <p className="text-gray-700">
                The security of your data is important to us. We implement industry-standard 
                security measures including:
              </p>
              <ul className="grid md:grid-cols-2 gap-4 mt-4">
                <li className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-600" />
                  <span>256-bit SSL encryption</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-600" />
                  <span>PCI DSS compliant payment processing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-600" />
                  <span>Regular security audits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-600" />
                  <span>Two-factor authentication</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <a href="mailto:privacy@nammacart.com" className="text-gray-600 hover:text-blue-600">
                    privacy@nammacart.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Phone</p>
                  <a href="tel:+919876543210" className="text-gray-600 hover:text-blue-600">
                    +91 98765 43210
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Address</p>
                  <p className="text-gray-600">
                    123 Tech Park, Chennai<br />
                    Tamil Nadu, India - 600001
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;