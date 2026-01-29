import { Routes, Route } from "react-router-dom";
import Hero from "./components/Hero";
import CategoryGrid from "./components/CategoryGrid";
import FeaturedProducts from "./components/FeaturedProducts";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/Cartpage";
import CheckoutPage from "./pages/Checkoutpage";
import Login from "./pages/LoginPage";
import Register from "./pages/Register";
import MainLayout from "./layout/Mainlayout";
import AuthLayout from "./layout/Authlayout";
import UserProfile from "./pages/Userpage";

const Home = () => (
  <>
    <Hero />
    <CategoryGrid />
    <FeaturedProducts />
  </>
);

function App() {
  return (
    <Routes>

      {/* Pages WITH navbar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<CategoryGrid />} />
        <Route path="/featured" element={<FeaturedProducts />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/profile" element={<UserProfile />} />
      </Route>

      {/* Pages WITHOUT navbar */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={<div className="p-20 text-center">404 – Page Not Found</div>}
      />

    </Routes>
  );
}

export default App;
