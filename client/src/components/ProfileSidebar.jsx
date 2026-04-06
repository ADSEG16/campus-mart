import React from "react";
import { 
  LayoutDashboard, 
  MessageCircle, 
  Settings,
  CheckCircle
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "../api/auth";
import { getStoredAuthToken } from "../api/http";

const ProfileSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { id: 1, name: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, path: "/dashboard" },
    { id: 2, name: "Messages", icon: <MessageCircle className="h-5 w-5" />, path: "/messages" },
    { id: 3, name: "Settings", icon: <Settings className="h-5 w-5" />, path: "/settings" }
  ];

  const initialUser = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "{}");
    } catch {
      return {};
    }
  }, []);

  const [currentUser, setCurrentUser] = React.useState(initialUser);

  React.useEffect(() => {
    const syncCurrentUser = async () => {
      const token = getStoredAuthToken();
      if (!token) return;

      try {
        const response = await getCurrentUser({ token });
        const freshUser = response?.data;
        if (freshUser && typeof freshUser === "object") {
          setCurrentUser(freshUser);
          localStorage.setItem("currentUser", JSON.stringify(freshUser));
        }
      } catch {
        // Keep existing local user if refresh fails.
      }
    };

    syncCurrentUser();
  }, []);

  const fullName = currentUser?.fullName || "Campus User";
  const email = currentUser?.email || "Not provided";
  const isVerified = Boolean(
    currentUser?.isVerified ||
    String(currentUser?.verificationStatus || "").toLowerCase() === "verified"
  );
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((part) => part?.[0] || "")
    .join("")
    .toUpperCase() || "CU";

  // Check if current path matches menu item path
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="w-full lg:w-64 bg-white rounded-2xl p-6">
      {/* User Profile */}
      <div className="mb-6 text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center mb-3">
          <span className="text-white font-semibold text-sm">{initials}</span>
        </div>
        <h2 className="font-semibold text-gray-900">{fullName}</h2>
        <p className="text-sm text-gray-500 break-all mt-0.5">{email}</p>
        <div className={`mt-2 inline-flex items-center space-x-1 text-sm ${isVerified ? "text-green-600" : "text-yellow-600"}`}>
          <CheckCircle className="h-4 w-4" />
          <span>{isVerified ? "Verified Student" : "Verification Pending"}</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.path) 
                ? "bg-blue-50 text-blue-600" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className={isActive(item.path) ? "text-blue-600" : "text-gray-400"}>
              {item.icon}
            </span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileSidebar;