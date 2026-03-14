import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Clock, MessageCircle } from "lucide-react";
import { useWatchlist } from "../../context/WatchlistContext";

const MyWatchlist = () => {
  const navigate = useNavigate();
  const { watchlist, removeFromWatchlist } = useWatchlist();

  const getConditionColor = (condition, color) => {
    const colorMap = {
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      orange: 'bg-orange-100 text-orange-800'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

  const handleRemoveFromWatchlist = (e, itemId) => {
    e.stopPropagation();
    removeFromWatchlist(itemId);
  };

  const handleViewDetails = (itemId) => {
    navigate(`/item/${itemId}`);
  };

  // Format time ago from addedAt date
  const getTimeAgo = (addedAt) => {
    if (!addedAt) return "Recently";
    
    const added = new Date(addedAt);
    const now = new Date();
    const diffInHours = Math.floor((now - added) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "1d ago";
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="max-w-6xl p-4 sm:p-6">
      {/* Header */}
      <div>
        {/* <h1 className="text-2xl font-bold text-gray-900 mb-2">My Watchlist</h1> */}
        <p className="text-gray-600">
          {watchlist.length} {watchlist.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {/* Watchlist Grid */}
      {watchlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {watchlist.map((item) => (
            <div 
              key={item.id} 
              className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewDetails(item.id)}
            >
              {/* Image Placeholder */}
              <div className="h-40 sm:h-48 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs sm:text-sm">Product Image</span>
                )}
                
                {/* Condition Badge */}
                <span className={`absolute top-2 sm:top-3 left-2 sm:left-3 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${getConditionColor(item.condition, item.conditionColor)}`}>
                  {item.condition}
                </span>
                
                {/* Price Tag */}
                <span className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold text-gray-900 shadow-sm">
                  {item.price}
                </span>

                {/* Time Ago */}
                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs text-gray-600">
                  <Clock className="h-3 w-3" />
                  <span>{getTimeAgo(item.addedAt)}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 line-clamp-2">{item.subtitle}</p>
                <p className="text-xs text-gray-500 mb-2 sm:mb-3 line-clamp-2">{item.description}</p>

                {/* User Info */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-2 sm:pt-3">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    {/* User Avatar */}
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                      {item.user.initials}
                    </div>
                    <div>
                      <div className="flex items-center flex-wrap gap-1">
                        <span className="text-xs sm:text-sm font-medium text-gray-900">{item.user.name}</span>
                        <span className="text-xs text-gray-500">{item.user.age}</span>
                        {item.user.verified && (
                          <span className="text-xs text-green-600 font-medium">✓</span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-blue-600">DETAILS</span>
                    </div>
                  </div>

                  {/* Action Icons */}
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button 
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={(e) => handleRemoveFromWatchlist(e, item.id)}
                    >
                      <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" fill="currentColor" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your watchlist is empty</h3>
          <p className="text-gray-500 mb-4">Save items you're interested in by clicking the heart icon</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Marketplace
          </button>
        </div>
      )}
    </div>
  );
};

export default MyWatchlist;