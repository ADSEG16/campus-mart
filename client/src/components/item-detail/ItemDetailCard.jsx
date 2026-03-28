import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Star, MessageCircle, Handshake, MapPin } from "lucide-react";

export default function ItemDetailsCard({ item }) {
  const navigate = useNavigate();

  if (!item) return <div className="p-6">Item not found</div>;

  // Helper function to get seller display name
  const getSellerDisplayName = () => {
    if (item.seller?.name) {
      return item.seller.name;
    }
    if (item.user?.name) {
      return item.user.name;
    }
    return "Seller";
  };

  // Helper function to get seller initials
  const getSellerInitials = () => {
    const name = getSellerDisplayName();
    if (name && name !== "Seller") {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return "S";
  };

  // Helper function to get seller age
  const getSellerAge = () => {
    if (item.seller?.age) {
      return item.seller.age;
    }
    if (item.user?.age) {
      return item.user.age;
    }
    return null;
  };

  // Helper function to get seller university
  const getSellerUniversity = () => {
    if (item.seller?.university) {
      return item.seller.university;
    }
    if (item.user?.university) {
      return item.user.university;
    }
    return null;
  };

  // Helper function to check if seller is verified
  const isSellerVerified = () => {
    if (item.seller?.verified !== undefined) {
      return item.seller.verified;
    }
    if (item.user?.verified !== undefined) {
      return item.user.verified;
    }
    return false;
  };

  // Helper function to get seller ID
  const getSellerId = () => {
    if (item.seller?.id) {
      return item.seller.id;
    }
    if (item.user?.id) {
      return item.user.id;
    }
    if (item.sellerId) {
      return item.sellerId;
    }
    return 1; // Default ID
  };

  const handleMessageSeller = () => {
    // Generate a unique ID for the conversation based on seller and item
    const conversationId = `${getSellerId()}_${item.id}`;
    
    // Navigate to messages page with new conversation data
    navigate("/messages", {
      state: {
        newConversation: {
          id: conversationId,
          name: getSellerDisplayName(),
          buying: item.title,
          verified: isSellerVerified(),
          sellerId: getSellerId(),
          itemId: item.id,
          itemImage: item.image,
          itemPrice: item.price,
          sellerAge: getSellerAge(),
          sellerUniversity: getSellerUniversity(),
          initialMessage: `Hi ${getSellerDisplayName()}! I'm interested in your ${item.title}. Is it still available?`
        },
        openChat: true
      }
    });
  };

  const handleViewProfile = () => {
    navigate(`/profile/${getSellerId()}`);
  };

  return (
    <div className="max-w-lg bg-white border border-gray-200 shadow-xs rounded-2xl p-6 space-y-6">

      {/* Top Section */}
      <div className="flex justify-between items-start">
        <span className="bg-green-200 text-green-800 text-sm font-semibold px-4 py-1 rounded-full">
          {item.condition} CONDITION
        </span>
        <Heart className="text-gray-400 cursor-pointer hover:text-red-500 transition-colors" />
      </div>

      {/* Product Title */}
      <h1 className="text-3xl font-bold text-gray-900 leading-tight">
        {item.title}
      </h1>

      {/* Subtitle */}
      {item.subtitle && (
        <p className="text-gray-500 text-sm">{item.subtitle}</p>
      )}

      {/* Price */}
      <div className="inline-block bg-blue-600 text-white text-xl font-semibold px-4 py-2 rounded-full">
        {item.price}
      </div>

      <hr className="text-gray-100" />

      {/* Seller Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span className="uppercase tracking-wide">
            {isSellerVerified() ? "Verified Seller" : "Seller"}
          </span>

          {/* Rating (fallback if not available) */}
          <span className="flex items-center gap-1 text-yellow-500 font-medium">
            <Star size={16} fill="currentColor" />
            {item.rating || "4.5"} ({item.reviewCount || "10"})
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-xl bg-orange-200 flex items-center justify-center font-semibold text-gray-700">
              {getSellerInitials()}
            </div>

            {/* Seller Info */}
            <div>
              <div className="flex items-center gap-1 font-semibold text-gray-900">
                {getSellerDisplayName()}
                {isSellerVerified() && (
                  <span className="text-blue-500 text-sm">✓</span>
                )}
              </div>
              {getSellerAge() && (
                <p className="text-sm text-gray-500">
                  Age {getSellerAge()}
                </p>
              )}
              {getSellerUniversity() && (
                <p className="text-xs text-gray-400">{getSellerUniversity()}</p>
              )}
            </div>
          </div>

          <button 
            onClick={handleViewProfile}
            className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>

      {/* Message Button */}
      <button 
        onClick={handleMessageSeller}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-3xl flex items-center justify-center gap-2 text-lg font-semibold shadow transition-colors"
      >
        <MessageCircle size={20} /> Message {getSellerDisplayName()}
      </button>

      {/* Confirm Interest */}
      <button className="w-full border border-gray-300 hover:border-blue-500 hover:bg-blue-50 py-4 rounded-3xl flex items-center justify-center gap-2 text-gray-700 text-lg font-medium transition-colors">
        <Handshake size={20} /> Confirm Interest / COD
      </button>

      {/* Meeting Preferences */}
      <div className="bg-blue-100 p-4 border border-blue-600 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <MapPin size={18} className="text-blue-600" />
          Meeting Preferences
        </div>

        <ul className="text-sm text-blue-600 list-disc ml-6 space-y-1">
          {item.meetingLocation ? (
            <li>
              <span className="text-gray-600">
                {item.meetingLocation}
              </span>
            </li>
          ) : (
            <li className="text-gray-500">No meeting preference set</li>
          )}
        </ul>
      </div>
    </div>
  );
}