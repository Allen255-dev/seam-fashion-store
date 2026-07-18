import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";

export default function CartDrawer() {
  const { items, isDrawerOpen, setIsDrawerOpen, updateQuantity, removeItem, subtotalCents } = useCart();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-paper shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10">
              <h2 className="font-display text-2xl tracking-tight">Your Cart</h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 -mr-2 text-ink/50 hover:text-ink transition-colors"
                aria-label="Close cart"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-ink/50 space-y-4">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p className="font-mono text-sm uppercase tracking-widest">Your cart is empty</p>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="mt-4 px-6 py-2 border border-ink hover:bg-ink hover:text-paper transition-colors font-mono text-xs uppercase tracking-widest"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-32 object-cover bg-paperDim"
                      />
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-display text-lg leading-tight">{item.name}</h3>
                            <button
                              onClick={() => removeItem(item.productId, item.size, item.color)}
                              className="text-ink/40 hover:text-ink transition-colors"
                            >
                              <X size={16} strokeWidth={1.5} />
                            </button>
                          </div>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50 mb-2">
                            {item.color} / {item.size}
                          </p>
                          <p className="text-sm">{formatPrice(item.priceCents)}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center border border-ink/20">
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                              className="p-1.5 text-ink/50 hover:text-ink transition-colors"
                            >
                              <Minus size={14} strokeWidth={1.5} />
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                              className="p-1.5 text-ink/50 hover:text-ink transition-colors"
                            >
                              <Plus size={14} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-ink/10 p-6 bg-paperDim/50">
                <div className="flex justify-between items-end mb-6">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink/60">Subtotal</span>
                  <span className="text-xl font-medium">{formatPrice(subtotalCents)}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => setIsDrawerOpen(false)}
                  className="block w-full bg-oxblood text-paper text-center py-4 font-mono text-xs uppercase tracking-widest hover:bg-oxblood-dark transition-colors"
                >
                  Checkout
                </Link>
                <p className="text-center text-ink/40 text-[10px] uppercase tracking-wider font-mono mt-4">
                  Shipping & taxes calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
