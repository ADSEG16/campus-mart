import React from "react";
import { Link } from "react-router-dom";
import { Heart, Clock, MessageCircle } from "lucide-react";

const MyWatchlist = () => {
  
  const watchlistItems = [
    {
      id: 1,
      title: "Noise Cancelling Headphones",
      subtitle: "Carryless Sony W-1HDQH4",
      description: "Portable for long study sessions...",
      price: "$45",
      condition: "EXCELLENT",
      conditionColor: "green",
      timeAgo: "2h ago",
      user: {
        initials: "AJ",
        name: "Alex J.",
        age: 21,
        verified: true
      }
    },
    {
      id: 2,
      title: "Biology Vol1. Textbook",
      subtitle: "Latest edition. Highlighters & markers.",
      description: "Includes digital access.",
      price: "$120",
      condition: "NEW",
      conditionColor: "blue",
      timeAgo: "3h ago",
      user: {
        initials: "SM",
        name: "Sarah M.",
        age: 19,
        verified: false
      }
    },
    {
      id: 3,
      title: "Mini Fridge - Dorm Ready",
      subtitle: "Compact refrigerator for your dorm room",
      description: "Perfect size for drinks and snacks...",
      price: "$85",
      condition: "LIKE NEW",
      conditionColor: "green",
      timeAgo: "1d ago",
      user: {
        initials: "JD",
        name: "James D.",
        age: 20,
        verified: true
      }
    },
    {
      id: 4,
      title: "Study Desk Lamp",
      subtitle: "Adjustable LED lamp with 3 brightness settings",
      description: "USB charging port, eye-caring technology...",
      price: "$15",
      condition: "FAIR",
      conditionColor: "orange",
      timeAgo: "3d ago",
      user: {
        initials: "RK",
        name: "Ryan K.",
        age: 22,
        verified: true
      }
    }
  ];

  const getConditionColor = (condition, color) => {
    const colorMap = {
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      orange: 'bg-orange-100 text-orange-800'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-6xl p-4 sm:p-6">
      {/* Watchlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {watchlistItems.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image Placeholder */}
            <div className="h-40 sm:h-48 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
              <span className="text-gray-400 text-xs sm:text-sm">Product Image</span>
              
              {/* Condition Badge */}
              <span className={`absolute top-2 sm:top-3 left-2 sm:left-3 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${getConditionColor(item.condition, item.conditionColor)}`}>
                {item.condition}
              </span>
              
              {/* Price Tag */}
              <span className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold text-gray-900 shadow-sm">
                {item.price}
              </span>

              {/* Time Ago - positioned at bottom left */}
              <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs text-gray-600">
                <Clock className="h-3 w-3" />
                <span>{item.timeAgo}</span>
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
                    <Link 
                      to={`/product/${item.id}`}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      DETAILS
                    </Link>
                  </div>
                </div>

                {/* Action Icons - Heart filled to emphasize liked item */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
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
    </div>
  );
};

export default MyWatchlist;