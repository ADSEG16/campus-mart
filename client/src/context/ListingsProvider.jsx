import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ListingsContext } from "./ListingsContext";
import { fetchProducts } from "../api/products";
import { fetchRecommendations } from "../api/recommendations";
import { getStoredAuthToken } from "../api/http";

export const ListingsProvider = ({ children }) => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadListings = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const token = getStoredAuthToken();
      const [result, recommended] = await Promise.all([
        fetchProducts(),
        token ? fetchRecommendations({ token }).catch(() => []) : Promise.resolve([]),
      ]);

      const recommendedIds = new Set((recommended || []).map((item) => String(item.id)));
      const merged = [...result];

      (recommended || []).forEach((item) => {
        const exists = merged.some((existing) => String(existing.id) === String(item.id));
        if (!exists) {
          merged.push(item);
        }
      });

      const ranked = merged
        .map((item) => ({
          ...item,
          isRecommended: recommendedIds.has(String(item.id)),
        }))
        .sort((a, b) => Number(Boolean(b.isRecommended)) - Number(Boolean(a.isRecommended)));

      setListings(ranked);
    } catch (error) {
      setLoadError(error.message || "Failed to load listings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

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

  const contextValue = useMemo(
    () => ({
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
    }),
    [listings, isLoading, loadError, loadListings]
  );

  return <ListingsContext.Provider value={contextValue}>{children}</ListingsContext.Provider>;
};