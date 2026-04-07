import React, { useMemo, useState } from "react";
import { 
  Eye, 
  MessageCircle, 
  Clock,
  MapPin,
  Image as ImageIcon
} from "lucide-react";
import MyListingsHeader from "./header";
import { useListings } from "../../context";
import { useNavigate } from "react-router-dom";
import HistoryList from "../transactions/history";
import { getStoredAuthToken } from "../../api/http";
import { deleteProduct, updateProduct } from "../../api/products";
import { useToast } from "../../context";

const MyListingsContent = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { listings, refreshListings } = useListings();
  const [hiddenListingIds, setHiddenListingIds] = useState([]);
  const [statusOverrides, setStatusOverrides] = useState({});
  const navigate = useNavigate();
  const { showToast } = useToast();
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const sellerListings = useMemo(() => {
    if (!currentUser?._id) {
      return listings;
    }

    return listings.filter((listing) => String(listing?.user?.id || "") === String(currentUser._id));
  }, [listings, currentUser?._id]);

  const sellerListingsWithOverrides = useMemo(() => {
    return sellerListings
      .filter((listing) => !hiddenListingIds.includes(String(listing.id)))
      .map((listing) => {
        const override = statusOverrides[String(listing.id)] || {};
        return { ...listing, ...override };
      });
  }, [sellerListings, hiddenListingIds, statusOverrides]);

  const tabs = [
    { id: "all", label: "All Listings", count: sellerListingsWithOverrides.length },
    { id: "active", label: "Active", count: sellerListingsWithOverrides.filter(l => l.status === "active").length },
    { id: "sold", label: "Sold", count: sellerListingsWithOverrides.filter(l => l.status === "sold").length },
    { id: "inactive", label: "Inactive", count: sellerListingsWithOverrides.filter(l => l.status === "inactive").length },
    { id: "transactions", label: "Transaction History" }
  ];

  const isTransactionTab = activeTab === "transactions";

  // Filter listings based on active tab
  const filteredListings = sellerListingsWithOverrides.filter(listing => {
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
      case "inactive":
        return (
          <span className="text-orange-700 bg-orange-100 rounded-2xl px-2 py-0.5">
            Inactive
          </span>
        );
      default:
        return null;
    }
  };

  const handleAction = async (action, listing) => {
    const syncListing = async (payload) => {
      const token = getStoredAuthToken();
      await updateProduct({ token, productId: listing.id, payload, imageFiles: [] });
      await refreshListings();
    };

    const runDelete = async () => {
      const token = getStoredAuthToken();
      await deleteProduct({ token, productId: listing.id });
      await refreshListings();
    };

    const listingId = String(listing.id);

    switch (action) {
      case "edit":
        navigate(`/edit-item/${listing.id}`);
        break;
      case "deactivate":
        setStatusOverrides((prev) => ({ ...prev, [listingId]: { status: "inactive" } }));
        showToast("Listing deactivated (syncing)...", "info");
        try {
          await syncListing({ availabilityStatus: "Unavailable" });
          setStatusOverrides((prev) => ({ ...prev, [listingId]: { status: "inactive" } }));
          showToast("Listing deactivated.", "success");
        } catch (error) {
          setStatusOverrides((prev) => ({ ...prev, [listingId]: { status: listing.status } }));
          showToast(error.message || "Failed to deactivate listing.", "error");
        }
        break;
      case "receipt":
        showToast("Open receipt from transaction history.", "info");
        break;
      case "relist":
        setStatusOverrides((prev) => ({ ...prev, [listingId]: { status: "active" } }));
        showToast("Relisting item (syncing)...", "info");
        try {
          await syncListing({ availabilityStatus: "Available" });
          showToast("Listing relisted.", "success");
        } catch (error) {
          setStatusOverrides((prev) => ({ ...prev, [listingId]: { status: listing.status } }));
          showToast(error.message || "Failed to relist listing.", "error");
        }
        break;
      case "chat":
        navigate("/messages");
        break;
      case "mark-sold":
        setStatusOverrides((prev) => ({ ...prev, [listingId]: { status: "sold" } }));
        showToast("Marking item as sold (syncing)...", "info");
        try {
          await syncListing({ availabilityStatus: "Sold", stock: 0 });
          showToast("Listing marked as sold.", "success");
        } catch (error) {
          setStatusOverrides((prev) => ({ ...prev, [listingId]: { status: listing.status } }));
          showToast(error.message || "Failed to mark as sold.", "error");
        }
        break;
      case "delete":
        setHiddenListingIds((prev) => [...prev, listingId]);
        showToast("Deleting listing...", "info");
        try {
          await runDelete();
          showToast("Listing deleted.", "success");
        } catch (error) {
          setHiddenListingIds((prev) => prev.filter((id) => id !== listingId));
          showToast(error.message || "Failed to delete listing.", "error");
        }
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
        delete: "Delete",
        receipt: "View Receipt",
        relist: "Relist",
        chat: "Chat",
        "mark-sold": "Mark Sold"
      };

      const actionColors = {
        edit: "text-blue-600 hover:text-blue-700",
        deactivate: "text-orange-600 hover:text-orange-700",
        delete: "text-red-600 hover:text-red-700",
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
    <div className="w-full relative">
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
            {typeof tab.count === "number" && (
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {isTransactionTab ? (
        <HistoryList />
      ) : (
        <>
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
                        {renderActions(listing).map((action, index, actions) => (
                          <React.Fragment key={index}>
                            {action}
                            {index < actions.length - 1 && (
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
        </>
      )}
    </div>
  );
};

export default MyListingsContent;