import React, { useState, useEffect } from "react";
import { WatchlistContext } from "./WatchlistContext";
import { getStoredAuthToken } from "../api/http";
import {
  getWatchlist,
  addWatchlistItem,
  removeWatchlistItem,
  clearWatchlistItems,
} from "../api/user";

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
  const [storageKey, setStorageKey] = useState(getWatchlistKey);

  const parseStoredWatchlist = (value) => {
    try {
      const parsed = JSON.parse(value || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const normalizeWatchlistItem = (item) => {
    const id = String(item?.id || item?._id || "");
    return {
      ...item,
      id,
      addedAt: item?.addedAt || new Date().toISOString(),
    };
  };

  // Load watchlist from localStorage on initial render
  const [watchlist, setWatchlist] = useState(() => {
    const savedWatchlist = parseStoredWatchlist(localStorage.getItem(storageKey));
    return savedWatchlist.map(normalizeWatchlistItem);
  });

  useEffect(() => {
    const syncWatchlistForCurrentUser = () => {
      const nextStorageKey = getWatchlistKey();
      const token = getStoredAuthToken();

      setStorageKey((prevStorageKey) => {
        if (prevStorageKey === nextStorageKey) {
          return prevStorageKey;
        }

        if (!token) {
          const savedWatchlist = parseStoredWatchlist(localStorage.getItem(nextStorageKey));
          setWatchlist(savedWatchlist.map(normalizeWatchlistItem));
        }

        return nextStorageKey;
      });

      if (token) {
        getWatchlist({ token })
          .then((serverWatchlist) => {
            setWatchlist((serverWatchlist || []).map(normalizeWatchlistItem));
          })
          .catch(() => {
            const savedWatchlist = parseStoredWatchlist(localStorage.getItem(nextStorageKey));
            setWatchlist(savedWatchlist.map(normalizeWatchlistItem));
          });
      }
    };

    syncWatchlistForCurrentUser();

    window.addEventListener("storage", syncWatchlistForCurrentUser);
    window.addEventListener("focus", syncWatchlistForCurrentUser);

    const syncIntervalId = window.setInterval(syncWatchlistForCurrentUser, 1000);

    return () => {
      window.removeEventListener("storage", syncWatchlistForCurrentUser);
      window.removeEventListener("focus", syncWatchlistForCurrentUser);
      window.clearInterval(syncIntervalId);
    };
  }, []);

  // Save to localStorage whenever watchlist changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(watchlist));
  }, [watchlist, storageKey]);

  // Add item to watchlist
  const addToWatchlist = (item) => {
    const token = getStoredAuthToken();
    const nextId = String(item?.id || item?._id || "");

    if (!nextId) {
      return;
    }

    if (token) {
      addWatchlistItem({ token, productId: nextId })
        .then((updatedWatchlist) => {
          setWatchlist((updatedWatchlist || []).map(normalizeWatchlistItem));
        })
        .catch(() => {
          setWatchlist((prev) => {
            const exists = prev.some((watchlistItem) => String(watchlistItem?.id || watchlistItem?._id || "") === nextId);
            if (!exists) {
              return [...prev, normalizeWatchlistItem(item)];
            }
            return prev;
          });
        });
      return;
    }

    setWatchlist(prev => {
      const exists = prev.some((watchlistItem) => String(watchlistItem?.id || watchlistItem?._id || "") === nextId);
      if (!exists) {
        return [...prev, normalizeWatchlistItem(item)];
      }
      return prev;
    });
  };

  // Remove item from watchlist
  const removeFromWatchlist = (itemId) => {
    const token = getStoredAuthToken();
    const normalizedId = String(itemId || "");

    if (token) {
      removeWatchlistItem({ token, productId: normalizedId })
        .then((updatedWatchlist) => {
          setWatchlist((updatedWatchlist || []).map(normalizeWatchlistItem));
        })
        .catch(() => {
          setWatchlist(prev => prev.filter((item) => String(item?.id || item?._id || "") !== normalizedId));
        });
      return;
    }

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
    const token = getStoredAuthToken();
    if (token) {
      clearWatchlistItems({ token })
        .then(() => {
          setWatchlist([]);
        })
        .catch(() => {
          setWatchlist([]);
        });
      return;
    }

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