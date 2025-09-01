'use client';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type CartItem = {
  id: string;
  brand?: string;
  model?: string;
  price?: number | null;
  quantity: number;
  slug?: string;
  category?: string;
  image?: string;
  blurb?: string;
  datasheet?: string;
  currency?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  updateItemQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);
const LS_KEY = 'cart:v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const hydrated = useRef(false); // evita doble init en StrictMode

  // Hidratar desde localStorage una sola vez en cliente
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : null;
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          setCartItems(arr.filter(Boolean));
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Persistir en localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LS_KEY, JSON.stringify(cartItems));
      }
    } catch { /* ignore */ }
  }, [cartItems]);

  const addItem: CartContextType['addItem'] = (item, qty = 1) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((it) => it.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        const current = copy[idx];
        const newQty = Math.max(1, (current.quantity || 1) + qty);
        copy[idx] = { ...current, ...item, quantity: newQty };
        return copy;
      }
      return [...prev, { ...item, quantity: Math.max(1, qty) }];
    });
  };

  const updateItemQuantity: CartContextType['updateItemQuantity'] = (id, qty) => {
    setCartItems((prev) => prev.map((it) => (it.id === id ? { ...it, quantity: Math.max(1, qty) } : it)));
  };

  const removeItem: CartContextType['removeItem'] = (id) => {
    setCartItems((prev) => prev.filter((it) => it.id !== id));
  };

  const clearCart: CartContextType['clearCart'] = () => setCartItems([]);

  const value = useMemo(() => ({ cartItems, addItem, updateItemQuantity, removeItem, clearCart }), [cartItems]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
