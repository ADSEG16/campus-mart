import React from "react";
import { Heart, Clock, Package, Star } from "lucide-react";

const QuickStats = () => {
  return (
    <div className="bg-[#0F172A] rounded-2xl border border-gray-200 p-5 mt-6 w-80 shadow-sm">
      {/* Header */}
      <h3 className="text-xs font-semibold text-gray-400 tracking-wider mb-4">
        QUICK STATS
      </h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Items Sold */}
        <div className="bg-[#2a37569a] rounded-lg p-3 text-center">
          <div className="flex justify-center mb-1">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-white block">12</span>
          <span className="text-xs text-gray-500">ITEMS SOLD</span>
        </div>

        {/* Rating */}
        <div className="bg-[#2a37569a] rounded-lg p-3 text-center">
          <div className="flex justify-center mb-1">
            <Star className="h-5 w-5 text-yellow-600" />
          </div>
          <span className="text-2xl font-bold text-white block">4.9</span>
          <span className="text-xs text-gray-500">RATING</span>
        </div>
      </div>

      {/* Action Links */}
      <div className="space-y-2">
        {/* My Watchlist */}
        <button className="flex items-center justify-between w-full hover:bg-gray-50 p-3 rounded-lg transition-colors group">
          <div className="flex items-center space-x-3">
            <Heart className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" />
            <span className="text-sm text-white">My Watchlist</span>
          </div>
          {/* <span className="text-xs text-gray-400">→</span> */}
        </button>

        {/* Transaction History */}
        <button className="flex items-center justify-between w-full hover:bg-gray-50 p-3 rounded-lg transition-colors group">
          <div className="flex items-center space-x-3">
            <Clock className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            <span className="text-sm text-white">Transaction History</span>
          </div>
          {/* <span className="text-xs text-gray-400">→</span> */}
        </button>
      </div>
    </div>
  );
};

export default QuickStats;