import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, Heart } from "lucide-react";
import { useListings } from "../../context";
import { useWatchlist } from "../../context";

const MarketplaceDashboard = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All Items");
  const { listings, isLoading, loadError } = useListings();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  
  const categories = ["All Items", "Textbooks", "Electronics", "Dorm Life", "Tickets"];
  
  // read search query from url
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("q")?.toLowerCase() || "";

  // Filter listings based on active category and search text
  const filteredListings = listings.filter((listing) => {
    const matchesCategory =
      activeCategory === "All Items" || listing.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      [listing.title, listing.subtitle, listing.description]
        .some((field) => field.toLowerCase().includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  const getConditionColor = (condition, color) => {
    const colorMap = {
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      orange: 'bg-orange-100 text-orange-800'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

  const handlePlaceOrder = (listingId) => {
    navigate(`/product/${listingId}`);
  };

  const handleCardKeyDown = (event, listingId) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handlePlaceOrder(listingId);
    }
  };

  const handleWatchlistToggle = (e, listing) => {
    e.stopPropagation();
    toggleWatchlist(listing);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center max-w-6xl mx-auto px-4 sm:px-6 bg-white">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
          Loading listings...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center max-w-6xl mx-auto px-4 sm:px-6 bg-white">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-4 sm:py-6 bg-white overflow-x-hidden">
      {/* Categories - Responsive */}
      <div className="mb-6 border-b border-gray-200 max-w-full overflow-x-auto overscroll-x-contain">
        <div className="flex w-max min-w-full space-x-4 pb-4 px-1 sm:space-x-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 text-sm font-medium whitespace-nowrap pb-2 ${
                activeCategory === category 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Grid Layout */}
      <div className="grid grid-cols-2 max-[380px]:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {/* Listings */}
        {filteredListings.length > 0 ? (
          filteredListings.map((listing) => (
            <article
              key={listing.id} 
              role="button"
              tabIndex={0}
              onClick={() => handlePlaceOrder(listing.id)}
              onKeyDown={(event) => handleCardKeyDown(event, listing.id)}
              className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow bg-white h-full flex flex-col cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {/* Image Placeholder */}
              <div className="h-32 sm:h-48 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                {listing.image ? (
                  <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs sm:text-sm">Product Image</span>
                )}
                
                {/* Condition Badge */}
                <span className={`absolute top-2 sm:top-3 left-2 sm:left-3 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium ${getConditionColor(listing.condition, listing.conditionColor)}`}>
                  {listing.condition}
                </span>
                
                {/* Price Tag */}
                <span className="absolute top-2 sm:top-3 right-12 sm:right-14 bg-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm font-bold text-gray-900 shadow-sm">
                  {listing.price}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleWatchlistToggle(e, listing)}
                  className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-white transition-colors"
                  aria-label={isInWatchlist(listing.id) ? "Remove from watchlist" : "Add to watchlist"}
                >
                  <Heart className={`h-4 w-4 ${isInWatchlist(listing.id) ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
                </button>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 line-clamp-2">{listing.title}</h3>
                <p className="text-[11px] sm:text-xs text-gray-500 mb-3 line-clamp-2 sm:line-clamp-3 flex-1">{listing.description}</p>

                <div className="mt-auto border-t border-gray-100 pt-3 flex items-center justify-between text-sm">
                  <div className="inline-flex min-w-8 items-center justify-center rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-700 sm:text-sm">
                    {Math.max(listing.stock || 0, 0)}
                  </div>

                  <div className="flex items-center text-blue-600 group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No items found in this category
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceDashboard;