import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, ChevronRight as ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [counts, setCounts] = useState({
    customers: 0,
    partners: 0
  });
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef(null);
  
  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800",
      title: "Summer Collection",
      subtitle: "Discover Your Perfect Style",
      discount: "60% OFF",
      bg: "from-orange-500 to-pink-500"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800",
      title: "New Arrivals",
      subtitle: "Fresh Styles Just Landed",
      discount: "UP TO 40% OFF",
      bg: "from-purple-500 to-indigo-500"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800",
      title: "Street Wear",
      subtitle: "Express Your Attitude",
      discount: "BUY 2 GET 1",
      bg: "from-blue-500 to-cyan-500"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800",
      title: "Accessories",
      subtitle: "Complete Your Look",
      discount: "FLAT 30% OFF",
      bg: "from-green-500 to-emerald-500"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          // Animate customers count to 10K
          let customersStart = 0;
          const customersEnd = 10000;
          const customersDuration = 2000;
          const customersStepTime = 20;
          const customersSteps = customersDuration / customersStepTime;
          const customersIncrement = customersEnd / customersSteps;

          const customersTimer = setInterval(() => {
            customersStart += customersIncrement;
            if (customersStart >= customersEnd) {
              setCounts(prev => ({ ...prev, customers: customersEnd }));
              clearInterval(customersTimer);
            } else {
              setCounts(prev => ({ ...prev, customers: Math.floor(customersStart) }));
            }
          }, customersStepTime);

          // Animate partners count to 500
          let partnersStart = 0;
          const partnersEnd = 500;
          const partnersDuration = 1500;
          const partnersStepTime = 20;
          const partnersSteps = partnersDuration / partnersStepTime;
          const partnersIncrement = partnersEnd / partnersSteps;

          const partnersTimer = setInterval(() => {
            partnersStart += partnersIncrement;
            if (partnersStart >= partnersEnd) {
              setCounts(prev => ({ ...prev, partners: partnersEnd }));
              clearInterval(partnersTimer);
            } else {
              setCounts(prev => ({ ...prev, partners: Math.floor(partnersStart) }));
            }
          }, partnersStepTime);

          return () => {
            clearInterval(customersTimer);
            clearInterval(partnersTimer);
          };
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [hasAnimated]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+';
    }
    return num + '+';
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50">
      {/* Main Container */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content - Static */}
          <div>
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
              🎉 Summer Sale 2026
            </span>
            
            {/* Dynamic Content based on slide */}
            <div className="transition-all duration-500">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                {slides[currentSlide].title}
                <span className={`block bg-gradient-to-r ${slides[currentSlide].bg} bg-clip-text text-transparent`}>
                  {slides[currentSlide].subtitle}
                </span>
              </h1>
            </div>
            
            <p className="text-gray-600 text-lg mb-8 max-w-xl">
              Shop the latest collection of premium shirts, jeans, and accessories.
              Get up to 60% off on new arrivals. Free shipping on all orders.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to='/shop' ><button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center transition-all transform hover:scale-105">
                Shop Now
                <ArrowRight className="ml-2" size={20} />
              </button>
              </Link>
             <Link to='/shop'> <button className="border-2 border-gray-800 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 hover:text-white transition-all">
                Explore Collections
              </button>
              </Link>
            </div>
            
            {/* Animated Stats */}
            <div ref={statsRef} className="grid grid-cols-3 gap-6 mt-12">
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="text-3xl font-bold text-gray-900">
                  {formatNumber(counts.customers)}
                </div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="text-3xl font-bold text-gray-900">
                  {counts.partners}+
                </div>
                <div className="text-gray-600">Brand Partners</div>
              </div>
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="text-3xl font-bold text-gray-900">24/7</div>
                <div className="text-gray-600">Customer Support</div>
              </div>
            </div>
          </div>

          {/* Image Carousel */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative z-10 overflow-hidden rounded-2xl">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`transition-all duration-700 ease-in-out ${
                    index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute top-0 left-0'
                  }`}
                >
                  <img 
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-[400px] md:h-[500px] object-cover rounded-2xl shadow-2xl"
                  />
                  
                  {/* Image Overlay Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${slide.bg} opacity-20 rounded-2xl`}></div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-30 transition-all hover:scale-110"
            >
              <ChevronLeft size={24} className="text-gray-800" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-30 transition-all hover:scale-110"
            >
              <ChevronRight size={24} className="text-gray-800" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30 hidden md:block">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'w-8 bg-blue-600' 
                      : 'w-2 bg-gray-400 hover:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl z-20 animate-bounce">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg">
                  <span className="text-2xl">🔥</span>
                </div>
                <div className="ml-3">
                  <div className="font-bold">Trending Now</div>
                  <div className="text-sm text-gray-600">Oversized T-Shirts</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-xl z-20">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{slides[currentSlide].discount}</div>
                <div className="text-sm text-gray-600">Limited Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;