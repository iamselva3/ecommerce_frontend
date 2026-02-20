import React from "react";

const SaleSeal = () => {
  return (
    <div className="pointer-events-none absolute left-12 top-20px z-30 rotate-[-15deg]">
      <div className="relative w-40 h-40 flex items-center justify-center">
        
        {/* Outer Seal */}
        <div
          className="
            w-full h-full
            rounded-full
            border-4 border-red-600
            flex items-center justify-center
            bg-white
            shadow-[0_15px_40px_rgba(0,0,0,0.15)]
          "
        >
          {/* Inner Circle */}
          <div className="w-32 h-32 rounded-full border-2 border-dashed border-red-500 flex items-center justify-center">
            
            <div className="text-center text-red-600">
              <div className="text-xs tracking-widest font-semibold">
                LIMITED OFFER
              </div>

              <div className="text-3xl font-extrabold tracking-wider">
                SALE
              </div>

              <div className="text-sm font-semibold">
                UP TO 50% OFF
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default SaleSeal;