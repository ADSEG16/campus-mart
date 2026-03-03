import React, { useState } from "react";
import { MapPin, Heart, MessageCircle } from "lucide-react";
import PostCard from "../PostCard";

const MarketplaceDashboard = () => {
  const [activeCategory, setActiveCategory] = useState("All Items");
  
  const categories = ["All Items", "Textbooks", "Electronics", "Dorm Life", "Tickets"];
  
  const listings = [
    {
      id: 1,
      title: "Noise Cancelling Headphones",
      subtitle: "Carryless Sony W-1HDQH4",
      description: "Portable for long study sessions...",
      price: "$45",
      condition: "EXCELLENT",
      conditionColor: "green",
      category: "Electronics", // Added category field
      image: null,
      user: {
        initials: "RK",
        name: "Ryan K.",
        age: 21,
        verified: true
      }
    },
    {
      id: 2,
      title: "Biology Vol 1. Textbook",
      subtitle: "Latest edition. Highlighters & markers.",
      description: "Includes digital access.",
      price: "$120",
      condition: "NEW",
      conditionColor: "blue",
      category: "Textbooks", // Added category field
      image: null,
      user: {
        initials: "JD",
        name: "James D.",
        age: 19,
        verified: false
      }
    },
    {
      id: 3,
      title: "Study Desk Lamp",
      subtitle: "Adjustable LED lamp with bioluminescent light source.",
      description: "USB charging...",
      price: "$15",
      condition: "FAIR",
      conditionColor: "orange",
      category: "Dorm Life", // Added category field
      image: null,
      user: {
        initials: "ML",
        name: "Michelle L.",
        age: 22,
        verified: true
      }
    }
  ];

  // Filter listings based on active category
  const filteredListings = activeCategory === "All Items" 
    ? listings 
    : listings.filter(listing => listing.category === activeCategory);

  const getConditionColor = (condition, color) => {
    const colorMap = {
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      orange: 'bg-orange-100 text-orange-800'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex flex-col justify-start max-w-6xl p-4 sm:p-6 bg-white">
     

      {/* Categories - Responsive */}
      <div className="mb-6 border-b border-gray-200">
        {/* Mobile: Horizontal scroll */}
        <div className="sm:hidden mx-auto pb-2 px-1">
          <div className="flex space-x-4 min-w-max">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`text-sm font-medium whitespace-nowrap py-2 px-1 ${
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

        {/* Tablet/Desktop: Normal flex layout */}
        <div className="hidden sm:flex sm:space-x-6 pb-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`text-sm font-medium pb-2 ${
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Listings - Now using filteredListings */}
        {filteredListings.map((listing) => (
          <div key={listing.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image Placeholder */}
            <div className="h-40 sm:h-48 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
              <span className="text-gray-400 text-xs sm:text-sm">Product Image</span>
              
              {/* Condition Badge */}
              <span className={`absolute top-2 sm:top-3 left-2 sm:left-3 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${getConditionColor(listing.condition, listing.conditionColor)}`}>
                {listing.condition}
              </span>
              
              {/* Price Tag */}
              <span className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold text-gray-900 shadow-sm">
                {listing.price}
              </span>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">{listing.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 line-clamp-2">{listing.subtitle}</p>
              <p className="text-xs text-gray-500 mb-2 sm:mb-3 line-clamp-2">{listing.description}</p>

              {/* User Info */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-2 sm:pt-3">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {/* User Avatar */}
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                    {listing.user.initials}
                  </div>
                  <div>
                    <div className="flex items-center flex-wrap gap-1">
                      <span className="text-xs sm:text-sm font-medium text-gray-900">{listing.user.name}</span>
                      <span className="text-xs text-gray-500">{listing.user.age}</span>
                      {listing.user.verified && (
                        <span className="text-xs text-green-600 font-medium">✓</span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-blue-600">DETAILS</span>
                  </div>
                </div>

                {/* Action Icons */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
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

export default MarketplaceDashboard; 