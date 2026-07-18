import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "seam_cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(product, size, color, quantity = 1) {
    setItems((prev) => {
      const key = (i) => `${i.productId}-${i.size}-${i.color}`;
      const newKey = `${product._id}-${size}-${color}`;
      const existing = prev.find((i) => key(i) === newKey);

      if (existing) {
        return prev.map((i) =>
          key(i) === newKey ? { ...i, quantity: i.quantity + quantity } : i
        );
      }

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          brand: product.brand,
          image: product.images?.[0],
          priceCents: product.priceCents,
          size,
          color,
          quantity,
        },
      ];
    });
    setIsDrawerOpen(true);
  }

  function updateQuantity(productId, size, color, quantity) {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId && i.size === size && i.color === color
            ? { ...i, quantity }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }

  function removeItem(productId, size, color) {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.size === size && i.color === color))
    );
  }

  function clearCart() {
    setItems([]);
  }

  const subtotalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ 
        items, 
        addItem, 
        updateQuantity, 
        removeItem, 
        clearCart, 
        subtotalCents, 
        itemCount,
        isDrawerOpen,
        setIsDrawerOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
