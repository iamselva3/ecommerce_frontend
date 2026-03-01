import React from 'react';
import { 
  Scale, FileText, Users, CreditCard, Truck, 
  RefreshCw, Shield, AlertCircle, Globe, Lock,
  Mail, Phone, MapPin, Clock, Gavel
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  const lastUpdated = "March 1, 2026";
  const effectiveDate = "January 1, 2026";

  const sections = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "1. Account Registration",
      content: [
        "You must be at least 18 years old to create an account",
        "Provide accurate, current, and complete information",
        "Maintain the security of your account and password",
        "Notify us immediately of any unauthorized access",
        "One person per account - no shared accounts",
        "We reserve the right to refuse service or terminate accounts",
        "You are responsible for all activities under your account"
      ]
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "2. Pricing and Payment",
      content: [
        "All prices are in Indian Rupees (INR) and include applicable taxes",
        "Prices may change without notice",
        "Payment methods: Credit/Debit Cards, UPI, Net Banking, Wallets",
        "Payment is processed through secure third-party gateways",
        "Orders are confirmed only after successful payment verification",
        "We accept COD (Cash on Delivery) for eligible orders",
        "EMI options available on select credit cards"
      ]
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "3. Shipping and Delivery",
      content: [
        "Delivery times are estimates, not guaranteed",
        "Shipping costs are calculated at checkout",
        "Free shipping on orders above ₹500",
        "Risk of loss passes to you upon delivery",
        "International shipping is currently not available",
        "Track your order in the 'My Orders' section",
        "Delivery attempted 3 times before return to seller"
      ]
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "4. Returns and Refunds",
      content: [
        "30-day return window for most products",
        "Items must be unused and in original packaging",
        "Free returns for defective or wrong items",
        "Refunds processed within 7-10 business days",
        "Store credit available for faster resolution",
        "Non-returnable items: innerwear, perishables, custom products",
        "Exchange available for size/color issues"
      ]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "5. Product Warranties",
      content: [
        "Manufacturer warranty applies where specified",
        "NammaCart extends 6-month warranty on electronics",
        "Warranty covers manufacturing defects only",
        "Damage from misuse or accidents not covered",
        "Claim warranty through 'My Orders' section",
        "Original invoice required for warranty claims"
      ]
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "6. Prohibited Activities",
      content: [
        "No automated scripts, bots, or scraping",
        "No reselling without authorization",
        "No fraudulent transactions or chargebacks",
        "No harassing other users or staff",
        "No posting false or misleading reviews",
        "No attempting to breach website security",
        "No infringing intellectual property rights"
      ]
    }
  ];

  const policies = [
    {
      title: "Order Cancellation",
      items: [
        "Cancel within 30 minutes of ordering for full refund",
        "Cancellation after 30 minutes may incur fees",
        "Seller can cancel orders due to stock issues",
        "We notify you immediately of any cancellations"
      ]
    },
    {
      title: "User Reviews",
      items: [
        "You retain ownership of your reviews",
        "We may use reviews for marketing purposes",
        "Reviews must be honest and not misleading",
        "We reserve right to remove inappropriate content"
      ]
    },
    {
      title: "Intellectual Property",
      items: [
        "NammaCart name, logo are trademarks",
        "Site content © 2026 NammaCart Pvt. Ltd.",
        "You may not copy or reproduce content",
        "User photos grant us usage license"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Gavel className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-xl text-indigo-100 mb-2">Last Updated: {lastUpdated}</p>
          <p className="text-indigo-200">Effective Date: {effectiveDate}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          
          {/* Introduction */}
          <div className="mb-12 border-b pb-8">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-8 h-8 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Agreement to Terms</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Welcome to NammaCart. By accessing or using our website, mobile application, 
              or any services provided by NammaCart ("Services"), you agree to be bound by 
              these Terms of Service ("Terms"). If you disagree with any part of these Terms, 
              you may not access or use our Services.
            </p>
            <p className="text-gray-600 leading-relaxed">
              These Terms constitute a legally binding agreement between you and NammaCart 
              Private Limited ("NammaCart," "we," "us," or "our"). Please read them carefully.
            </p>
          </div>

          {/* Key Sections Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {sections.map((section, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow hover:border-indigo-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-indigo-600 bg-indigo-50 p-2 rounded-lg">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                </div>
                <ul className="space-y-2">
                  {section.content.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                      <span className="text-indigo-600 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Additional Policies */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Policies</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {policies.map((policy, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">{policy.title}</h3>
                  <ul className="space-y-2">
                    {policy.items.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-indigo-600 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="mb-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Limitation of Liability</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                To the maximum extent permitted by law, NammaCart shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or goodwill</li>
                <li>Product unavailability or delivery delays</li>
                <li>Third-party conduct or content</li>
                <li>Unauthorized access to your account</li>
              </ul>
              <p className="mt-4 text-sm">
                Our total liability shall not exceed the amount you paid for the product 
                or ₹1,000, whichever is less.
              </p>
            </div>
          </div>

          {/* Indemnification */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Indemnification</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree to indemnify and hold harmless NammaCart, its affiliates, officers, 
              directors, employees, and agents from any claims, damages, losses, liabilities, 
              costs, and expenses (including reasonable attorneys' fees) arising from:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600 ml-4">
              <li>Your use of our Services</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Your content or conduct on the platform</li>
            </ul>
          </div>

          {/* Governing Law */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Governing Law</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of 
              India. Any disputes arising under or in connection with these Terms shall be 
              subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu.
            </p>
          </div>

          {/* Changes to Terms */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. Changes will 
              be effective immediately upon posting. Your continued use of our Services after 
              any such changes constitutes your acceptance of the new Terms. We will notify 
              users of material changes via email or website notice.
            </p>
          </div>

          {/* Severability */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Severability</h2>
            <p className="text-gray-600 leading-relaxed">
              If any provision of these Terms is held to be unenforceable or invalid, such 
              provision will be changed and interpreted to accomplish the objectives of such 
              provision to the greatest extent possible under applicable law, and the remaining 
              provisions will continue in full force and effect.
            </p>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about these Terms, please contact us:
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <a href="mailto:legal@nammacart.com" className="text-sm text-gray-600 hover:text-indigo-600">
                    legal@nammacart.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Phone</p>
                  <a href="tel:+919876543210" className="text-sm text-gray-600 hover:text-indigo-600">
                    +91 98765 43210
                  </a>
                  <p className="text-xs text-gray-500">Mon-Fri, 9AM-6PM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Address</p>
                  <p className="text-sm text-gray-600">
                    NammaCart Private Limited<br />
                    123 Tech Park, Chennai<br />
                    Tamil Nadu, India - 600001
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Response Time</p>
                  <p className="text-sm text-gray-600">
                    Within 24-48 hours<br />
                    Emergency: +91 98765 43210
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Acknowledgement */}
          <div className="mt-8 p-4 bg-indigo-50 rounded-lg text-center">
            <p className="text-gray-700">
              By using NammaCart, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last reviewed: {lastUpdated}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;