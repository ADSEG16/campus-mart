import { Navigate, Outlet } from "react-router-dom";
import { getStoredAuthToken } from "../api/http";

export default function ProtectedRoute({ children }) {
  const token = getStoredAuthToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
}