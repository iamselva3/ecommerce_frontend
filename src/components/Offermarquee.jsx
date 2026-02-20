import React from 'react';
import { Tag, Zap, Gift, Percent } from 'lucide-react';

const OfferMarquee = () => {
  const offers = [
    { icon: <Percent size={16} />, text: "FLAT 50% OFF on All Shirts", code: "SHIRT50" },
    { icon: <Zap size={16} />, text: "Buy 2 Get 1 Free on T-Shirts", code: "B2G1" },
    { icon: <Gift size={16} />, text: "Free Shipping on orders above ₹500", code: "FREESHIP" },
    { icon: <Tag size={16} />, text: "Extra 10% Off on First Order", code: "WELCOME10" },
    { icon: <Percent size={16} />, text: "Bank Offers: 20% Cashback on Cards", code: "BANK20" },
  ];

  const duplicatedOffers = [...offers, ...offers];

  return (
    <div className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white py-2 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {duplicatedOffers.map((offer, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-2 text-sm font-medium px-4"
          >
            <span className="bg-white/20 p-1 rounded-full">
              {offer.icon}
            </span>
            <span>{offer.text}</span>
            <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs">
              {offer.code}
            </span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default OfferMarquee;