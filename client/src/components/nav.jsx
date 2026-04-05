import React, { useState } from "react";
import { NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import Notifications from "./NotificationCard";
import BrandLogo from "./BrandLogo";


const CampusNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // initialize from query param so input reflects current search
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    setSearchText(q);
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchText.trim();
    if (!query) return;
    navigate(`/dashboard?q=${encodeURIComponent(query)}`);
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-3 flex items-center justify-between gap-4">
      {/* Logo */}
      <BrandLogo to="/marketplace" compact />

      {/* Search Bar Desktop */}
      <div className="hidden md:block flex-1 max-w-xl mx-4">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search textbooks, dorm gear, electronics..."
            className="w-full border border-gray-300 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-gray-400"
          />
          {/* Search icon */}
          <svg 
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </form>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center space-x-5">
        {location.pathname !== "/marketplace" && (
          <NavLink
            to="/marketplace"
            className={({ isActive }) =>
              `text-sm font-medium hover:text-blue-500 ${isActive ? 'text-blue-600' : 'text-gray-700'}`
            }
          >
            Marketplace
          </NavLink>
        )}
        <NavLink
          to="/watchlist"
          className={({ isActive }) =>
            `text-sm font-medium hover:text-blue-500 ${isActive ? 'text-blue-600' : 'text-gray-700'}`
          }
        >
          Watchlist
        </NavLink>
        <NavLink
          to="/safety"
          className={({ isActive }) =>
            `text-sm font-medium hover:text-blue-500 ${isActive ? 'text-blue-600' : 'text-gray-700'}`
          }
        >
          Safety
        </NavLink>
       
        
        {/* Notification Bell Icon */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="text-gray-600 hover:text-black"
          >
            <svg 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
              />
            </svg>
            {/* Notification dot */}
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 z-50 w-80">
              <Notifications />
            </div>
          )}
        </div>

        <Link to="/post-item" className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-full transition-colors">
          {/* Plus icon */}
          <svg 
            className="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v16m8-8H4" 
            />
          </svg>
          <span>Post Item</span>
        </Link>

        <Link to="/settings" className="text-gray-600 hover:text-black">
          <svg 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
            />
          </svg>
        </Link>
      </div>

      {/* Mobile toggles */}
      <div className="flex md:hidden items-center gap-3">
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="p-0 text-gray-700"
          aria-label="Toggle navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close navigation drawer"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[82vw] max-w-sm bg-white shadow-2xl p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-0 text-gray-700"
                aria-label="Close navigation drawer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSearch} className="relative mb-5">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search products..."
                className="w-full border border-gray-300 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-gray-400"
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </form>

            <div className="space-y-2">
              <NavLink to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                Dashboard
              </NavLink>
              {location.pathname !== "/marketplace" && (
                <NavLink to="/marketplace" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                  Marketplace
                </NavLink>
              )}
              <NavLink to="/watchlist" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                Watchlist
              </NavLink>
              <NavLink to="/messages" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                Messages
              </NavLink>
              <NavLink to="/settings" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                Settings
              </NavLink>
              <NavLink to="/safety" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                Safety
              </NavLink>
              <Link to="/post-item" onClick={() => setIsMobileMenuOpen(false)} className="block text-center px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium mt-4">
                Post Item
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default CampusNavbar;