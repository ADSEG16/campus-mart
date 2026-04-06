import { Navigate, Outlet } from "react-router-dom";
import { getStoredAuthToken } from "../api/http";

export default function AdminRoute({ children }) {
  const token = getStoredAuthToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let isAdmin = false;
  try {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    isAdmin = currentUser?.role === "admin";
  } catch {
    isAdmin = false;
  }

  if (!isAdmin) {
    return <Navigate to="/marketplace" replace />;
  }

  return children || <Outlet />;
}
