import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  
  if (!token) {
    return <Navigate to="/" />;
  }

  if (adminOnly) {
    try {
      const user = JSON.parse(userStr);
      if (user?.role !== "admin") {
        return <Navigate to="/dashboard" />;
      }
    } catch {
      return <Navigate to="/" />;
    }
  }

  return children;
}
