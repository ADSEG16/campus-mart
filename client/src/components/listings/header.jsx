import React from "react";
import { Plus, ArrowUpDown } from "lucide-react";

const MyListingsHeader = () => {
  
  return (
    <div className="w-full flex flex-row justify-between mb-6">
      {/* Header with title and description */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Listings</h1>
        <p className="text-sm text-gray-500">
          Manage your active and sold items in the campus marketplace.
        </p>
      </div>

      {/* Action Bar with Sort and New Listing */}
      <div className="flex items-center gap-4 justify-between">
        {/* Sort Button */}
        <button className="inline-flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
          <ArrowUpDown className="h-4 w-4 text-gray-500" />
          <span>Sort</span>
        </button>

        {/* New Listing Button */}
        <button className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="h-4 w-4" />
          <span>New Listing</span>
        </button>
      </div>
    </div>
  );
};

export default MyListingsHeader;