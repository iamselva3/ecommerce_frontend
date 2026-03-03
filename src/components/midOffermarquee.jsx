import React from 'react';
import { Tag, Zap, Gift, Percent, Award, TrendingUp } from 'lucide-react';

const MidOfferMarquee = () => {
  const offers = [
    { text: "FLAT 50% OFF", highlight: "Shirts" },
    { text: "BUY 2 GET 1", highlight: "T-Shirts" },
    { text: "FREE SHIPPING", highlight: "₹500+" },
    { text: "10% EXTRA", highlight: "First Order" },
    { text: "20% CASHBACK", highlight: "Bank Offers" },
    { text: "FLASH SALE", highlight: "24 Hours" },
  ];

  const duplicatedOffers = [...offers, ...offers];

  return (
    <div className="w-full bg-gradient-to-r from-blue-50 via-white to-purple-50 border-y border-blue-100 py-3 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {duplicatedOffers.map((offer, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-2 text-sm font-semibold px-6"
          >
            <span className="text-blue-600 text-lg">•</span>
            <span className="text-gray-800">{offer.text}</span>
            <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
              {offer.highlight}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MidOfferMarquee;