import React, { useState } from "react";
import { ListingsContext } from "./ListingsContext";

export const ListingsProvider = ({ children }) => {
  const [listings, setListings] = useState([
    {
      id: 1,
      title: "Noise Cancelling Headphones",
      subtitle: "Carryless Sony W-1HDQH4",
      description:
        "Selling my Sony WH-1000XM4 headphones. Perfect for studying and blocking noise.",
      price: "GHC45",
      condition: "EXCELLENT",
      conditionColor: "green",
      category: "Electronics",
      image: null,

      // 🔥 NEW: Full detail fields
      highlights: [
        "Original carrying case included",
        "Battery lasts ~30 hours",
        "Cleaned and sanitized",
      ],
      rating: 4.9,
      reviewCount: 24,
      meetingPoints: [
        "Student Union (Ground Floor)",
        "Main Library Entrance",
      ],

      user: {
        initials: "RK",
        name: "Ryan K.",
        age: 21,
        verified: true,
      },

      status: "active",
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
      subtitle: "Latest edition. Highlighted sections included.",
      description:
        "Biology textbook in great condition. Includes notes and digital access.",
      price: "GHC120",
      condition: "NEW",
      conditionColor: "blue",
      category: "Textbooks",
      image: null,

      highlights: [
        "Latest edition",
        "Includes digital access",
        "Well maintained",
      ],
      rating: 4.7,
      reviewCount: 15,
      meetingPoints: [
        "Main Library Entrance",
        "Science Block Lobby",
      ],

      user: {
        initials: "JD",
        name: "James D.",
        age: 19,
        verified: false,
      },

      status: "active",
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
      subtitle: "Adjustable LED lamp",
      description:
        "Compact desk lamp with adjustable brightness and USB charging.",
      price: "GHC15",
      condition: "FAIR",
      conditionColor: "orange",
      category: "Dorm Life",
      image: null,

      highlights: [
        "Adjustable brightness",
        "Energy efficient LED",
        "USB powered",
      ],
      rating: 4.3,
      reviewCount: 8,
      meetingPoints: [
        "Library North",
        "Student Hostel Entrance",
      ],

      user: {
        initials: "ML",
        name: "Michelle L.",
        age: 22,
        verified: true,
      },

      status: "pending",
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

  // ✅ Add listing (AUTO adds full fields)
  const addListing = (newListing) => {
    const listing = {
      id: listings.length + 1,
      ...newListing,

      highlights: newListing.highlights || [],
      rating: 0,
      reviewCount: 0,
      meetingPoints: newListing.meetingPoints || [],

      views: 0,
      inquiries: 0,
      postedDate: "Just now",
      status: "active",
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

  // ✅ Update listing status
  const updateListingStatus = (id, status, additionalData = {}) => {
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === id ? { ...listing, status, ...additionalData } : listing
      )
    );
  };

  // ✅ Update listing
  const updateListing = (id, updatedData) => {
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === id ? { ...listing, ...updatedData } : listing
      )
    );
  };

  // ✅ Delete listing
  const deleteListing = (id) => {
    setListings((prev) =>
      prev.filter((listing) => listing.id !== id)
    );
  };

  // ✅ Get listing by ID (safe)
  const getListingById = (id) => {
    return listings.find((listing) => listing.id === Number(id));
  };

  // ✅ Filter by status
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