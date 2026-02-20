import React from "react";

const SaleBadge = () => {
  return (
    <div className="pointer-events-none absolute right-12 top-[-50px] z-30">
      <div
        className="
          w-36 h-36
          bg-gradient-to-br from-red-500 via-pink-500 to-orange-400
          text-white
          flex flex-col items-center justify-center
          shadow-[0_20px_50px_rgba(255,0,0,0.35)]
          backdrop-blur-xl
          animate-float
        "
        style={{
          borderRadius: "60% 40% 55% 45% / 60% 35% 65% 40%",
        }}
      >
        <span className="text-xs tracking-widest opacity-90">
          LIMITED TIME
        </span>
        <span className="text-3xl font-extrabold leading-tight">
          SALE
        </span>
        <span className="text-sm font-semibold">
          UP TO 50%
        </span>
      </div>
    </div>
  );
};

export default SaleBadge;