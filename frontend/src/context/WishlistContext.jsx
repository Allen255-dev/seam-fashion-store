import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const refresh = useCallback(() => {
    if (!user) {
      setItems([]);
      return;
    }
    api
      .get("/wishlist")
      .then((data) => setItems(data.items))
      .catch(() => setItems([]));
  }, [user]);

  useEffect(refresh, [refresh]);

  async function toggle(productId) {
    if (!user) return false; // caller should redirect to login
    const isSaved = items.some((p) => p._id === productId);
    if (isSaved) {
      await api.del(`/wishlist/${productId}`);
    } else {
      await api.post(`/wishlist/${productId}`, {});
    }
    refresh();
    return true;
  }

  function isWishlisted(productId) {
    return items.some((p) => p._id === productId);
  }

  return (
    <WishlistContext.Provider value={{ items, toggle, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
