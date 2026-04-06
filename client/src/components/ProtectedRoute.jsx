import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser } from "../api/auth";
import { getStoredAuthToken } from "../api/http";

export default function ProtectedRoute({ children }) {
  const token = getStoredAuthToken();
  const [accessState, setAccessState] = useState("loading");
  const [redirectTo, setRedirectTo] = useState("");

  useEffect(() => {
    const resolveAccess = async () => {
      if (!token) {
        setRedirectTo("/login");
        setAccessState("blocked");
        return;
      }

      try {
        const response = await getCurrentUser({ token });
        const currentUser = response?.data || {};
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        const isVerified = Boolean(
          currentUser?.isVerified ||
          currentUser?.emailVerified ||
          String(currentUser?.verificationStatus || "").toLowerCase() === "verified"
        );

        if (!isVerified) {
          setRedirectTo("/marketplace");
          setAccessState("blocked");
          return;
        }

        setAccessState("allowed");
      } catch {
        setRedirectTo("/login");
        setAccessState("blocked");
      }
    };

    resolveAccess();
  }, [token]);

  if (accessState === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Checking access...</div>;
  }

  if (accessState === "blocked") {
    return <Navigate to={redirectTo || "/login"} replace />;
  }

  return children || <Outlet />;
}