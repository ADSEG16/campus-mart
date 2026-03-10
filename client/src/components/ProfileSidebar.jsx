import React from "react";
import { 
  User, 
  LayoutDashboard, 
  Package, 
  History, 
  MessageCircle, 
  Settings,
  CheckCircle
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const ProfileSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { id: 1, name: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, path: "/dashboard" },
    { id: 2, name: "My Listings", icon: <Package className="h-5 w-5" />, path: "/my-listings" },
    { id: 3, name: "Transaction History", icon: <History className="h-5 w-5" />, path: "/transactions" },
    { id: 4, name: "Messages", icon: <MessageCircle className="h-5 w-5" />, path: "/messages" },
    { id: 5, name: "Settings", icon: <Settings className="h-5 w-5" />, path: "/settings" }
  ];

  // Check if current path matches menu item path
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="w-64 bg-white border rounded-2xl border-gray-200 p-6">
      {/* User Profile */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Alex Johnson</h2>
            <div className="flex items-center space-x-1 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Verified Student</span>
            </div>
          </div>
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