import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product } from '../backend';
import { useDiscounts } from '../hooks/useDiscounts';

const CART_KEY = 'agrisync_cart';
const CART_MAX_AGE_DAYS = 7;

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: string; // ISO date string
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: bigint) => void;
  updateQuantity: (productId: bigint, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDiscount: () => { name: string; amount: number } | null;
  getFinalTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());
  const { calculateDiscount } = useDiscounts();

  // Save cart to localStorage whenever items change
  useEffect(() => {
    saveCart(items);
  }, [items]);

  // Clean up old items on mount
  useEffect(() => {
    const maxAge = new Date();
    maxAge.setDate(maxAge.getDate() - CART_MAX_AGE_DAYS);

    setItems((prev) =>
      prev.filter((item) => new Date(item.addedAt) > maxAge)
    );
  }, []);

  const addItem = useCallback((product: Product, quantity: number) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeItem = useCallback((productId: bigint) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: bigint, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getSubtotal = useCallback(() => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    // Alias for getSubtotal for backward compatibility
    return getSubtotal();
  }, [getSubtotal]);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getDiscount = useCallback(() => {
    const subtotal = getSubtotal();
    const discountResult = calculateDiscount(subtotal, items);

    if (discountResult) {
      return {
        name: discountResult.discount.name,
        amount: discountResult.amount,
      };
    }

    return null;
  }, [items, getSubtotal, calculateDiscount]);

  const getFinalTotal = useCallback(() => {
    const subtotal = getSubtotal();
    const discount = getDiscount();
    return subtotal - (discount?.amount || 0);
  }, [getSubtotal, getDiscount]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        getSubtotal,
        getDiscount,
        getFinalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

function loadCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    
    // Filter out items older than CART_MAX_AGE_DAYS
    const maxAge = new Date();
    maxAge.setDate(maxAge.getDate() - CART_MAX_AGE_DAYS);
    
    return parsed.filter((item: CartItem) => new Date(item.addedAt) > maxAge);
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save cart:', error);
  }
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
