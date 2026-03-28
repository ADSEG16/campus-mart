import React from "react";

const ItemDetailsCard = () => {
  return (
    <div className="max-w-xs mb-6 bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Placeholder Image */}
      <div className="w-full h-48 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <span className="text-gray-400 text-sm">Product Image</span>
      </div>
      
      {/* Content */}
      <div className="p-5">
        {/* Section Title */}
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          ITEM DETAILS
        </h3>
        
        {/* Item Title */}
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Organic Chemistry: Structure and Function (8th Ed)
        </h2>
        
        {/* Price */}
        <p className="text-2xl font-bold text-blue-500 mb-3">
          GHC45.00
        </p>
        
        {/* Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-gray-500">Status</span>
          <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
            AVAILABLE
          </span>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsCard;