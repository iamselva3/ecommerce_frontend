// import React from 'react';
// import Navbar from './components/Nav';
// import Hero from './components/Hero';
// import CategoryGrid from './components/CategoryGrid';
// import FeaturedProducts from './components/FeaturedProducts';


// // import Newsletter from './components/Newsletter';
// // import Footer from './components/Footer';

// function App() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <Hero />
//       <CategoryGrid />
//       <FeaturedProducts />
//       {/* <TrendingProducts /> */}
//       {/* <Banner /> */}
//       {/* <Newsletter /> */}
//       {/* <Footer /> */}
//     </div>
//   );
// }

// export default App;


import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Nav";
import Hero from "./components/Hero";
import CategoryGrid from "./components/CategoryGrid";
import FeaturedProducts from "./components/FeaturedProducts";
import CategoryPage from "./pages/CategoryPage";

const Home = () => (
  <>
    <Hero />
    <CategoryGrid />
    <FeaturedProducts />
  </>
);

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/categories"
          element={<CategoryGrid />}
        />

        <Route
          path="/featured"
          element={<FeaturedProducts />}
        />
         <Route path="/category/:category" element={<CategoryPage />} />

        {/* future */}
        {/* <Route path="/category/:slug" element={<CategoryPage />} /> */}
        {/* <Route path="/product/:id" element={<ProductPage />} /> */}

        <Route
          path="*"
          element={<div className="p-20 text-center">404 – Page Not Found</div>}
        />
      </Routes>
    </div>
  );
}

export default App;
