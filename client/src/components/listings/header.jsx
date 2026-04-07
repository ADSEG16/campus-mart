import React from "react";
import { Plus, ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";

const MyListingsHeader = () => {
  
  return (
      <div className="w-full flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
      {/* Header with title and description */}
        <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Manage your active and sold items in the campus marketplace.
        </p>
      </div>

      {/* Action Bar with Sort and New Listing */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
        {/* Sort Button */}
          <button className="inline-flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors w-full sm:w-auto">
          <ArrowUpDown className="h-4 w-4 text-gray-500" />
          <span>Sort</span>
        </button>

        {/* New Listing Button */}
          <Link to="/post-item" className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          <span>New Listing</span>
        </Link>
      </div>
    </div>
  );
};

export default MyListingsHeader;