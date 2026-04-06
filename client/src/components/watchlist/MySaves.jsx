import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Heart } from "lucide-react";
import { useWatchlist } from "../../context";

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
    navigate(`/product/${itemId}`);
  };

  const handleCardKeyDown = (event, itemId) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleViewDetails(itemId);
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto px-3 sm:px-4 lg:px-4 py-4 sm:py-6">
      {/* Header */}
      <div>
        {/* <h1 className="text-2xl font-bold text-gray-900 mb-2">My Watchlist</h1> */}
        <p className="text-gray-600">
          {watchlist.length} {watchlist.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {/* Watchlist Grid */}
      {watchlist.length > 0 ? (
        <div className="grid grid-cols-2 max-[380px]:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {watchlist.map((item) => (
            <article 
              key={item.id} 
              role="button"
              tabIndex={0}
              onClick={() => handleViewDetails(item.id)}
              onKeyDown={(event) => handleCardKeyDown(event, item.id)}
              className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow bg-white h-full flex flex-col cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {/* Image Placeholder */}
              <div className="h-32 sm:h-48 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs sm:text-sm">Product Image</span>
                )}
                
                {/* Condition Badge */}
                <span className={`absolute top-2 sm:top-3 left-2 sm:left-3 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium ${getConditionColor(item.condition, item.conditionColor)}`}>
                  {item.condition}
                </span>
                
                {/* Price Tag */}
                <span className="absolute top-2 sm:top-3 right-12 sm:right-14 bg-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm font-bold text-gray-900 shadow-sm">
                  {item.price}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleRemoveFromWatchlist(e, item.id)}
                  className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-white transition-colors"
                  aria-label="Remove from watchlist"
                >
                  <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 line-clamp-2">{item.title}</h3>
                <p className="text-[11px] sm:text-xs text-gray-500 mb-3 line-clamp-2 sm:line-clamp-3 flex-1">{item.description}</p>

                <div className="mt-auto border-t border-gray-100 pt-3 flex items-center justify-between text-sm">
                  <div className="inline-flex items-center justify-center rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-700 sm:text-sm">
                    {Math.max(item.stock || 0, 0)} stock available
                  </div>

                  <div className="flex items-center gap-1 text-blue-600 group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
                    <span className="text-xs font-semibold uppercase tracking-wide">View</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </article>
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