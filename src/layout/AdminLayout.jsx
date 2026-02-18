import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Upload, Star, Users, Package,
  LogOut, Settings, ChevronDown, Menu, X,
  Home, Bell, Search, UserCircle,
  Package2,
  ShoppingCart
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const navItems = [
    { 
      to: "/admin/dashboard", 
      icon: <LayoutDashboard size={20} />, 
      label: "Dashboard",
      description: "Overview & statistics"
    },
    { 
      to: "/admin/products", 
      icon: <Package size={20} />, 
      label: "Products",
      description: "Manage inventory"
    },
    { 
      to: "/admin/upload", 
      icon: <Upload size={20} />, 
      label: "Upload Products",
      description: "Add new products"
    },
    { 
      to: "/admin/featured", 
      icon: <Star size={20} />, 
      label: "Featured",
      description: "Manage featured items"
    },
    { 
      to: "/admin/users", 
      icon: <Users size={20} />, 
      label: "Users",
      description: "Manage customers"
    },
     { 
      to: "/admin/orders", 
      icon: <ShoppingCart size={20} />, 
      label: "Orders",
      description: "Manage orders"
    },
  ];

  const linkClass = ({ isActive }) => {
    const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative";
    const activeClasses = isActive
      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
      : "text-gray-400 hover:bg-gray-800 hover:text-white hover:translate-x-1";
    
    return `${baseClasses} ${activeClasses}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-black text-white z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-800 rounded-lg relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg"
            >
              <UserCircle size={24} />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-50">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-medium text-gray-900">{user.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email || ''}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 to-black text-white
        transition-all duration-300 z-50
        ${isSidebarOpen ? 'w-72' : 'w-20'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {isSidebarOpen ? (
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              NammaCart Admin
            </h2>
          ) : (
            <h2 className="text-xl font-bold mx-auto">S</h2>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-gray-800 rounded-lg hidden lg:block"
          >
            <ChevronDown size={18} className={`transform transition-transform ${!isSidebarOpen ? 'rotate-90' : '-rotate-90'}`} />
          </button>
        </div>

        {/* User Info - Collapsible */}
        {isSidebarOpen && (
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.name || 'Admin User'}</p>
                <p className="text-xs text-gray-400 truncate">{user.email || 'admin@nammacart.com'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {isSidebarOpen && (
                <>
                  <span className="flex-1 font-medium">{item.label}</span>
                  <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.description}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        {isSidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-all"
            >
              <Home size={20} />
              <span>Back to Store</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-600/10 hover:text-red-300 rounded-xl transition-all mt-2"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={`
        transition-all duration-300 min-h-screen bg-gray-100
        ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}
        ${isMobileMenuOpen ? 'overflow-hidden' : ''}
      `}>
        {/* Top Bar */}
        <div className="bg-white shadow-sm sticky top-0 z-30 hidden lg:block">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium">{user.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500">{user.role || 'Administrator'}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex flex-col items-center justify-center flex-1 h-full
                ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}
              `}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;