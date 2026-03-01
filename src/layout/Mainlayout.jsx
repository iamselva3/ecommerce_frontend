import Footer from "../components/Footer";
import Navbar from "../components/Nav";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Outlet />
      

      <Footer />
    

    </div>
  );
};

export default MainLayout;
