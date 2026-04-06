import React, { useState, useEffect } from "react";
import { WatchlistContext } from "./WatchlistContext";

const getWatchlistKey = () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const userId = currentUser?._id || "guest";
    return `watchlist:${userId}`;
  } catch {
    return "watchlist:guest";
  }
};

export const WatchlistProvider = ({ children }) => {
  // Load watchlist from localStorage on initial render
  const [watchlist, setWatchlist] = useState(() => {
    const savedWatchlist = localStorage.getItem(getWatchlistKey());
    return savedWatchlist ? JSON.parse(savedWatchlist) : [];
  });

  useEffect(() => {
    const handleStorage = () => {
      const savedWatchlist = localStorage.getItem(getWatchlistKey());
      setWatchlist(savedWatchlist ? JSON.parse(savedWatchlist) : []);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Save to localStorage whenever watchlist changes
  useEffect(() => {
    localStorage.setItem(getWatchlistKey(), JSON.stringify(watchlist));
  }, [watchlist]);

  // Add item to watchlist
  const addToWatchlist = (item) => {
    setWatchlist(prev => {
      const nextId = String(item?.id || item?._id || "");
      const exists = prev.some((watchlistItem) => String(watchlistItem?.id || watchlistItem?._id || "") === nextId);
      if (!exists) {
        return [...prev, { ...item, id: nextId, addedAt: new Date().toISOString() }];
      }
      return prev;
    });
  };

  // Remove item from watchlist
  const removeFromWatchlist = (itemId) => {
    const normalizedId = String(itemId || "");
    setWatchlist(prev => prev.filter((item) => String(item?.id || item?._id || "") !== normalizedId));
  };

  // Check if item is in watchlist
  const isInWatchlist = (itemId) => {
    const normalizedId = String(itemId || "");
    return watchlist.some((item) => String(item?.id || item?._id || "") === normalizedId);
  };

  // Toggle item in watchlist
  const toggleWatchlist = (item) => {
    if (isInWatchlist(item.id)) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist(item);
    }
  };

  // Clear watchlist
  const clearWatchlist = () => {
    setWatchlist([]);
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        toggleWatchlist,
        clearWatchlist
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};