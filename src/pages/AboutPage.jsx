import React from "react";

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">About Us</h1>

      <p className="text-gray-700 leading-relaxed mb-6">
        We’re a modern online clothing store focused on quality, comfort,
        and clean design. No overhyped drops, no fake discounts —
        just solid products that actually last.
      </p>

      <p className="text-gray-700 leading-relaxed mb-6">
        Every product you see here is carefully selected and tested.
        From everyday wear to statement pieces, our goal is simple:
        make you look good without overcomplicating things.
      </p>

      <div className="grid sm:grid-cols-3 gap-6 mt-10">
        <div className="p-6 rounded-xl border">
          <h3 className="font-semibold text-lg mb-2">Quality First</h3>
          <p className="text-gray-600 text-sm">
            Premium fabrics, solid stitching, and proper sizing.
          </p>
        </div>

        <div className="p-6 rounded-xl border">
          <h3 className="font-semibold text-lg mb-2">Honest Pricing</h3>
          <p className="text-gray-600 text-sm">
            No inflated MRP, no fake offers.
          </p>
        </div>

        <div className="p-6 rounded-xl border">
          <h3 className="font-semibold text-lg mb-2">Fast Support</h3>
          <p className="text-gray-600 text-sm">
            Real responses from real people.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
