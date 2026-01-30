import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;
