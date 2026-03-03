import React from "react";

const CampusNavbar = () => {
  return (
    <nav className="w-full bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
      {/* Logo with image */}
      <div className="flex items-center space-x-2">
        {/* Campus logo SVG */}
        <svg 
          className="h-8 w-8 text-blue-600" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <span className="text-xl font-bold text-black">CampusMart</span>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <input
            type="text"
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
        </div>
      </div>

      {/* Right side: Browse, Safety, Icons, and Post Item */}
      <div className="flex items-center space-x-6">
        <button className="text-sm font-medium text-gray-700 hover:text-black">
          Browse
        </button>
        <button className="text-sm font-medium text-gray-700 hover:text-black">
          Safety
        </button>
        
        {/* Notification Bell Icon */}
        <button className="relative text-gray-600 hover:text-black">
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

       

        {/* Post Item Button */}
        <button className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-full transition-colors">
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
        </button>

         {/* Profile Icon */}
        <button className="text-gray-600 hover:text-black">
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
        </button>
      </div>
    </nav>
  );
};

export default CampusNavbar;