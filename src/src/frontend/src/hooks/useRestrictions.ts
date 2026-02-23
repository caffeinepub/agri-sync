import { useState, useEffect, useCallback } from 'react';
import { Product, ProductCategory } from '../backend';

const RESTRICTIONS_KEY = 'agrisync_restrictions';

export interface Restriction {
  id: string;
  type: 'category' | 'product' | 'seller' | 'buyer' | 'region';
  targetId: string; // product ID, category, principal, or region name
  reason: string;
  active: boolean;
  createdAt: string; // ISO date string
  createdBy?: string; // admin principal
}

export interface RestrictionCheck {
  isRestricted: boolean;
  reason?: string;
}

/**
 * Hook for managing restrictions (client-side for now)
 * Ready for backend integration - replace localStorage with API calls
 */
export function useRestrictions() {
  const [restrictions, setRestrictions] = useState<Restriction[]>(() => {
    return loadRestrictions();
  });

  // Save restrictions to localStorage whenever they change
  useEffect(() => {
    saveRestrictions(restrictions);
  }, [restrictions]);

  const createRestriction = useCallback((restriction: Omit<Restriction, 'id' | 'createdAt'>) => {
    const newRestriction: Restriction = {
      ...restriction,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setRestrictions((prev) => [...prev, newRestriction]);
    return newRestriction;
  }, []);

  const updateRestriction = useCallback((id: string, updates: Partial<Restriction>) => {
    setRestrictions((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const deleteRestriction = useCallback((id: string) => {
    setRestrictions((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const getActiveRestrictions = useCallback(() => {
    return restrictions.filter((r) => r.active);
  }, [restrictions]);

  const checkProductRestriction = useCallback(
    (product: Product): RestrictionCheck => {
      const activeRestrictions = getActiveRestrictions();

      // Check product-specific restriction
      const productRestriction = activeRestrictions.find(
        (r) => r.type === 'product' && r.targetId === product.id.toString()
      );
      if (productRestriction) {
        return { isRestricted: true, reason: productRestriction.reason };
      }

      // Check category restriction
      const categoryRestriction = activeRestrictions.find(
        (r) => r.type === 'category' && r.targetId === product.category
      );
      if (categoryRestriction) {
        return { isRestricted: true, reason: categoryRestriction.reason };
      }

      // Check seller restriction
      const sellerRestriction = activeRestrictions.find(
        (r) => r.type === 'seller' && r.targetId === product.farmer.toString()
      );
      if (sellerRestriction) {
        return { isRestricted: true, reason: sellerRestriction.reason };
      }

      return { isRestricted: false };
    },
    [getActiveRestrictions]
  );

  const checkBuyerRestriction = useCallback(
    (buyerPrincipal: string): RestrictionCheck => {
      const activeRestrictions = getActiveRestrictions();

      const buyerRestriction = activeRestrictions.find(
        (r) => r.type === 'buyer' && r.targetId === buyerPrincipal
      );

      if (buyerRestriction) {
        return { isRestricted: true, reason: buyerRestriction.reason };
      }

      return { isRestricted: false };
    },
    [getActiveRestrictions]
  );

  const checkRegionRestriction = useCallback(
    (region: string): RestrictionCheck => {
      const activeRestrictions = getActiveRestrictions();

      const regionRestriction = activeRestrictions.find(
        (r) => r.type === 'region' && r.targetId.toLowerCase() === region.toLowerCase()
      );

      if (regionRestriction) {
        return { isRestricted: true, reason: regionRestriction.reason };
      }

      return { isRestricted: false };
    },
    [getActiveRestrictions]
  );

  return {
    restrictions,
    createRestriction,
    updateRestriction,
    deleteRestriction,
    getActiveRestrictions,
    checkProductRestriction,
    checkBuyerRestriction,
    checkRegionRestriction,
  };
}

function loadRestrictions(): Restriction[] {
  try {
    const stored = localStorage.getItem(RESTRICTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRestrictions(restrictions: Restriction[]): void {
  try {
    localStorage.setItem(RESTRICTIONS_KEY, JSON.stringify(restrictions));
  } catch (error) {
    console.error('Failed to save restrictions:', error);
  }
}

function generateId(): string {
  return `restriction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
