import React, { useState } from "react";
import { 
  Eye, 
  MessageCircle, 
  Edit, 
  Power, 
  Receipt, 
  RefreshCw,
  Clock,
  MapPin,
  CheckCircle,
  Image as ImageIcon
} from "lucide-react";
import MyListingsHeader from "./header";
import { useListings } from "../../context/ListingsContext";
import { useNavigate } from "react-router-dom";

const MyListingsContent = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { listings, updateListingStatus, } = useListings(); //deleteListing 
  const navigate = useNavigate();

  const tabs = [
    { id: "all", label: "All Listings", count: listings.length },
    { id: "active", label: "Active", count: listings.filter(l => l.status === "active").length },
    { id: "sold", label: "Sold", count: listings.filter(l => l.status === "sold").length },
    { id: "pending", label: "Pending", count: listings.filter(l => l.status === "pending").length }
  ];

  // Filter listings based on active tab
  const filteredListings = listings.filter(listing => {
    if (activeTab === "all") return true;
    return listing.status === activeTab;
  });

  const getStatusDisplay = (listing) => {
    switch(listing.status) {
      case "active":
        return (
          <span className="text-green-600 bg-green-200 rounded-2xl px-2 py-0.5">
            Active
          </span>
        );
      case "sold":
        return (
          <span className="text-gray-600 bg-gray-200 rounded-2xl px-2 py-0.5">
            {listing.soldTo ? `Sold to ${listing.soldTo} (COD)` : "Sold (COD)"}
          </span>
        );
      case "pending":
        return (
          <span className="text-yellow-600 bg-yellow-200 rounded-2xl px-2 py-0.5">
            Pending Meeting
          </span>
        );
      default:
        return null;
    }
  };

  const handleAction = (action, listing) => {
    switch(action) {
    case "edit":
      navigate(`/edit-item/${listing.id}`); // Navigate to edit page
      break;
      case "deactivate":
        updateListingStatus(listing.id, "inactive");
        break;
      case "receipt":
        console.log("View receipt:", listing.id);
        break;
      case "relist":
        updateListingStatus(listing.id, "active");
        break;
      case "chat":
        console.log("Open chat:", listing.id);
        break;
      case "mark-sold":
        updateListingStatus(listing.id, "sold", {
          soldTo: "Buyer",
          soldDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        });
        break;
      default:
        break;
    }
  };

  const renderActions = (listing) => {
    return listing.actions.map((action, index) => {
      const actionLabels = {
        edit: "Edit",
        deactivate: "Deactivate",
        receipt: "View Receipt",
        relist: "Relist",
        chat: "Chat",
        "mark-sold": "Mark Sold"
      };

      const actionColors = {
        edit: "text-blue-600 hover:text-blue-700",
        deactivate: "text-gray-600 hover:text-gray-900",
        receipt: "text-blue-600 hover:text-blue-700",
        relist: "text-gray-600 hover:text-gray-900",
        chat: "text-blue-600 hover:text-blue-700",
        "mark-sold": "text-green-600 hover:text-green-700"
      };

      return (
        <button
          key={index}
          onClick={() => handleAction(action, listing)}
          className={`${actionColors[action]} font-medium text-sm`}
        >
          {actionLabels[action]}
        </button>
      );
    });
  };

  const renderStatusMetrics = (listing) => {
    switch(listing.status) {
      case "active":
        return (
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{listing.views} Views</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{listing.inquiries} Inquiries</span>
            </div>
            <span>Posted {listing.postedDate}</span>
          </div>
        );
      case "sold":
        return (
          <div className="text-sm text-gray-500">
            {listing.soldDate}
          </div>
        );
      case "pending":
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-3.5 w-3.5" />
              <span>Meeting scheduled: {listing.meetingTime}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-3.5 w-3.5" />
              <span>{listing.meetingLocation}</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl p-6 relative">
      <MyListingsHeader />
      
      {/* Tabs */}
      <div className="flex space-x-6 mb-6 border-b-2 border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 text-sm font-medium relative ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Listings Container */}
      <div className="space-y-4">
        {filteredListings.length > 0 ? (
          filteredListings.map((listing) => (
            <div 
              key={listing.id} 
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                {/* Product Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  {listing.image ? (
                    <img src={listing.image} alt={listing.title} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>

                {/* Listing Details */}
                <div className="flex-1">
                  {/* Top row with title and price */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-row gap-3 items-center">
                      <h3 className="font-medium text-gray-900">{listing.title}</h3>
                      <span className="text-gray-500">{getStatusDisplay(listing)}</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {listing.price}
                    </div>
                  </div>

                  {/* Status-specific metrics */}
                  <div className="mb-3">
                    {renderStatusMetrics(listing)}
                  </div>

                  {/* Bottom row with action buttons */}
                  <div className="flex items-center space-x-3 text-sm">
                    {renderActions(listing).map((action, index) => (
                      <React.Fragment key={index}>
                        {action}
                        {index < listing.actions.length - 1 && (
                          <span className="text-gray-300">|</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            No {activeTab} listings found
          </div>
        )}
      </div>

      {/* Pagination/Items Count */}
      {filteredListings.length > 0 && (
        <div className="mt-6 text-sm text-gray-500 text-center">
          Showing 1–{filteredListings.length} of {filteredListings.length} items
        </div>
      )}
    </div>
  );
};

export default MyListingsContent;