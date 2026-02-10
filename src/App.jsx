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
import ShopPage from "./pages/ShopPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import DealsPage from "./pages/DealsPage";

import AdminLayout from "./layout/AdminLayout";
import AdminRoute from "./AdminRoutes";
import AdminUpload from "./Admin/AdminUpload";
import AdminFeatured from "./Admin/AdminFeatured";
import AdminUsers from "./Admin/AdminUser";
import AdminLogin from "./Admin/AdminLogin";
import AdminProducts from "./Admin/AdminProducts";
import AdminEditProduct from "./Admin/AdminEditProduct";
import AdminDashboard from "./Admin/AdminDashboard";
import HelpCenter from "./pages/Helpcentre";
import ProductPage from "./pages/ProductPage";
import PaymentPage from "./pages/PaymentPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import OrdersListPage from "./pages/OrderListPage";
import WishlistPage from "./pages/WishlistPage";

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
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/track-order/:orderId" element={<OrderTrackingPage />} />
          <Route path="/orders" element={<OrdersListPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
      </Route>

      {/* Pages WITHOUT navbar */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />

    
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        {/* <Route path="dashboard" element={<div>Dashboard</div>} /> */}
        <Route path="upload" element={<AdminUpload />} />
        <Route path="featured" element={<AdminFeatured />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="products" element={<AdminProducts />} />
<Route path="products/edit/:id" element={<AdminEditProduct />} />
<Route path="dashboard" element={<AdminDashboard />} />
      </Route>

     
      <Route
        path="*"
        element={<div className="p-20 text-center">404 – Page Not Found</div>}
      />

    </Routes>
  );
}

export default App;
