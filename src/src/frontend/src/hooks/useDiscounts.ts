import { useState, useEffect, useCallback } from 'react';
import { Product } from '../backend';

const DISCOUNTS_KEY = 'agrisync_discounts';

export interface Discount {
  id: string;
  name: string;
  type: 'seasonal' | 'bulk' | 'firstTime' | 'farmer';
  value: number; // percentage (0-100) or fixed amount
  isPercentage: boolean;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validFrom: string; // ISO date string
  validUntil: string; // ISO date string
  targetType: 'all' | 'category' | 'product';
  targetValue?: string; // category name or product ID
  farmerPrincipal?: string; // if type is 'farmer', the farmer who created it
  active: boolean;
}

/**
 * Hook for managing discounts (client-side for now)
 * Ready for backend integration - replace localStorage with API calls
 */
export function useDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>(() => {
    return loadDiscounts();
  });

  // Save discounts to localStorage whenever they change
  useEffect(() => {
    saveDiscounts(discounts);
  }, [discounts]);

  const createDiscount = useCallback((discount: Omit<Discount, 'id'>) => {
    const newDiscount: Discount = {
      ...discount,
      id: generateId(),
    };
    setDiscounts((prev) => [...prev, newDiscount]);
    return newDiscount;
  }, []);

  const updateDiscount = useCallback((id: string, updates: Partial<Discount>) => {
    setDiscounts((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  }, []);

  const deleteDiscount = useCallback((id: string) => {
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const getActiveDiscounts = useCallback(() => {
    const now = new Date();
    return discounts.filter((d) => {
      if (!d.active) return false;
      const validFrom = new Date(d.validFrom);
      const validUntil = new Date(d.validUntil);
      return now >= validFrom && now <= validUntil;
    });
  }, [discounts]);

  const getExpiredDiscounts = useCallback(() => {
    const now = new Date();
    return discounts.filter((d) => {
      const validUntil = new Date(d.validUntil);
      return now > validUntil;
    });
  }, [discounts]);

  const getDiscountForProduct = useCallback(
    (product: Product) => {
      const activeDiscounts = getActiveDiscounts();
      return activeDiscounts.find((d) => {
        if (d.targetType === 'all') return true;
        if (d.targetType === 'category') return d.targetValue === product.category;
        if (d.targetType === 'product') return d.targetValue === product.id.toString();
        return false;
      });
    },
    [getActiveDiscounts]
  );

  const calculateDiscount = useCallback(
    (orderAmount: number, items: { product: Product; quantity: number }[]) => {
      const activeDiscounts = getActiveDiscounts();
      let bestDiscount: { discount: Discount; amount: number } | null = null;

      for (const discount of activeDiscounts) {
        // Check minimum order amount
        if (discount.minOrderAmount && orderAmount < discount.minOrderAmount) {
          continue;
        }

        // Check if discount applies to any product in cart
        let applies = false;
        if (discount.targetType === 'all') {
          applies = true;
        } else if (discount.targetType === 'category') {
          applies = items.some((item) => item.product.category === discount.targetValue);
        } else if (discount.targetType === 'product') {
          applies = items.some((item) => item.product.id.toString() === discount.targetValue);
        }

        if (!applies) continue;

        // Calculate discount amount
        let discountAmount = 0;
        if (discount.isPercentage) {
          discountAmount = (orderAmount * discount.value) / 100;
        } else {
          discountAmount = discount.value;
        }

        // Apply max discount cap
        if (discount.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, discount.maxDiscountAmount);
        }

        // Keep best discount
        if (!bestDiscount || discountAmount > bestDiscount.amount) {
          bestDiscount = { discount, amount: discountAmount };
        }
      }

      return bestDiscount;
    },
    [getActiveDiscounts]
  );

  return {
    discounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    getActiveDiscounts,
    getExpiredDiscounts,
    getDiscountForProduct,
    calculateDiscount,
  };
}

function loadDiscounts(): Discount[] {
  try {
    const stored = localStorage.getItem(DISCOUNTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveDiscounts(discounts: Discount[]): void {
  try {
    localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(discounts));
  } catch (error) {
    console.error('Failed to save discounts:', error);
  }
}

function generateId(): string {
  return `discount_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
