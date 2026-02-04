import React, { useState } from "react";
import { ChevronDown, Search, Mail, Phone } from "lucide-react";

const faqs = [
  {
    question: "How do I place an order?",
    answer:
      "Select a product, choose your size, add it to cart, and complete checkout."
  },
  {
    question: "Can I cancel my order?",
    answer:
      "Yes, you can cancel before the order is shipped from your orders page."
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery usually takes 3–5 business days depending on your location."
  },
  {
    question: "What is your return policy?",
    answer:
      "Returns are accepted within 7 days of delivery if the product is unused."
  }
];

const HelpCenter = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2">Help Center</h1>
      <p className="text-gray-600 mb-8">
        Find answers or reach out to us — we’ve got you.
      </p>

      {/* Search */}
      <div className="relative mb-10">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search for help..."
          className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* FAQs */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 cursor-pointer"
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{faq.question}</h3>
                <ChevronDown
                  className={`transition ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </div>

              {openIndex === index && (
                <p className="text-gray-600 mt-3">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gray-100 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Still need help?</h2>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg flex-1">
            <Mail className="text-black" />
            <div>
              <p className="font-medium">Email Support</p>
              <p className="text-sm text-gray-600">support@stylehub.com</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-4 rounded-lg flex-1">
            <Phone className="text-black" />
            <div>
              <p className="font-medium">Call Us</p>
              <p className="text-sm text-gray-600">+91 98765 43210</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
