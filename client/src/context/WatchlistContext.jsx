import React, { createContext, useState, useContext, useEffect } from "react";

const WatchlistContext = createContext();

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
};

export const WatchlistProvider = ({ children }) => {
  // Load watchlist from localStorage on initial render
  const [watchlist, setWatchlist] = useState(() => {
    const savedWatchlist = localStorage.getItem("watchlist");
    return savedWatchlist ? JSON.parse(savedWatchlist) : [];
  });

  // Save to localStorage whenever watchlist changes
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  // Add item to watchlist
  const addToWatchlist = (item) => {
    setWatchlist(prev => {
      // Check if item already exists
      const exists = prev.some(watchlistItem => watchlistItem.id === item.id);
      if (!exists) {
        return [...prev, { ...item, addedAt: new Date().toISOString() }];
      }
      return prev;
    });
  };

  // Remove item from watchlist
  const removeFromWatchlist = (itemId) => {
    setWatchlist(prev => prev.filter(item => item.id !== itemId));
  };

  // Check if item is in watchlist
  const isInWatchlist = (itemId) => {
    return watchlist.some(item => item.id === itemId);
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