import React, { useEffect, useState } from "react";
import { ListingsContext } from "./ListingsContext";
import { fetchProducts } from "../api/products";

export const ListingsProvider = ({ children }) => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadListings = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const result = await fetchProducts();
      setListings(result);
    } catch (error) {
      setLoadError(error.message || "Failed to load listings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

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
    return listings.find((listing) => String(listing.id) === String(id));
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
        isLoading,
        loadError,
        refreshListings: loadListings,
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
};