import React, { useState } from "react";
import { ListingsContext } from "./ListingsContext";

export const ListingsProvider = ({ children }) => {
  // Initial mock listings
  const [listings, setListings] = useState([
    {
      id: 1,
      title: "Noise Cancelling Headphones",
      subtitle: "Carryless Sony W-1HDQH4",
      description: "Portable for long study sessions...",
      price: "GHC45",
      condition: "EXCELLENT",
      conditionColor: "green",
      category: "Electronics",
      image: null,
      user: {
        initials: "RK",
        name: "Ryan K.",
        age: 21,
        verified: true,
      },
      status: "active",
      statusLabel: "ACTIVE",
      views: 142,
      inquiries: 3,
      postedDate: "2 days ago",
      actions: ["edit", "deactivate"],
      soldTo: null,
      soldDate: null,
      meetingTime: null,
      meetingLocation: null,
      createdAt: new Date("2024-10-10"),
    },
    {
      id: 2,
      title: "Biology Vol 1. Textbook",
      subtitle: "Latest edition. Highlighters & markers.",
      description: "Includes digital access.",
      price: "GHC120",
      condition: "NEW",
      conditionColor: "blue",
      category: "Textbooks",
      image: null,
      user: {
        initials: "JD",
        name: "James D.",
        age: 19,
        verified: false,
      },
      status: "active",
      statusLabel: "ACTIVE",
      views: 89,
      inquiries: 5,
      postedDate: "5 days ago",
      actions: ["edit", "deactivate"],
      soldTo: null,
      soldDate: null,
      meetingTime: null,
      meetingLocation: null,
      createdAt: new Date("2024-10-05"),
    },
    {
      id: 3,
      title: "Study Desk Lamp",
      subtitle: "Adjustable LED lamp with bioluminescent light source.",
      description: "USB charging...",
      price: "GHC15",
      condition: "FAIR",
      conditionColor: "orange",
      category: "Dorm Life",
      image: null,
      user: {
        initials: "ML",
        name: "Michelle L.",
        age: 22,
        verified: true,
      },
      status: "pending",
      statusLabel: "PENDING",
      views: 45,
      inquiries: 2,
      postedDate: "1 day ago",
      actions: ["chat", "mark-sold"],
      soldTo: null,
      soldDate: null,
      meetingTime: "Today, 4:00 PM",
      meetingLocation: "Library North",
      createdAt: new Date("2024-10-12"),
    },
  ]);

  // Add a new listing
  const addListing = (newListing) => {
    const listing = {
      id: listings.length + 1,
      ...newListing,
      views: 0,
      inquiries: 0,
      postedDate: "Just now",
      status: "active",
      statusLabel: "ACTIVE",
      actions: ["edit", "deactivate"],
      createdAt: new Date(),
      user: {
        initials: "AJ",
        name: "Alex Johnson",
        age: 20,
        verified: true,
      },
    };
    setListings((prev) => [listing, ...prev]);
    return listing;
  };

  // Update listing status
  const updateListingStatus = (id, status, additionalData = {}) => {
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === id ? { ...listing, status, ...additionalData } : listing
      )
    );
  };

  // Update listing (for editing)
  const updateListing = (id, updatedData) => {
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === id ? { ...listing, ...updatedData } : listing
      )
    );
  };

  // Delete listing
  const deleteListing = (id) => {
    setListings((prev) => prev.filter((listing) => listing.id !== id));
  };

  // Get listing by ID
  const getListingById = (id) => {
    return listings.find((listing) => listing.id === id);
  };

  // Filter listings by status
  const getListingsByStatus = (status) => {
    if (status === "all") return listings;
    return listings.filter((listing) => listing.status === status);
  };

  return (
    <ListingsContext.Provider
      value={{
        listings,
        addListing,
        updateListing,
        updateListingStatus,
        deleteListing,
        getListingById,
        getListingsByStatus,
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
};