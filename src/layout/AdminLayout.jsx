import { NavLink, Outlet } from "react-router-dom";

const AdminLayout = () => {
  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-md transition
     ${
       isActive
         ? "bg-white text-black font-semibold"
         : "text-gray-300 hover:bg-gray-800 hover:text-white"
     }`;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-5">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

        <nav className="space-y-3">
          <NavLink to="/admin/dashboard" className={linkClass}>
            — Dashboard
          </NavLink>

          <NavLink to="/admin/upload" className={linkClass}>
            — Upload Images
          </NavLink>

          <NavLink to="/admin/featured" className={linkClass}>
            — Featured Products
          </NavLink>

          <NavLink to="/admin/users" className={linkClass}>
            — Users
          </NavLink>

          <NavLink to="/admin/products" className={linkClass}>
            — Products
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
