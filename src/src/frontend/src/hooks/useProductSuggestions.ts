import { useState, useEffect, useCallback } from 'react';
import { Product, ProductCategory } from '../backend';

const LAST_VIEWED_KEY = 'agrisync_lastViewed';
const MAX_LAST_VIEWED = 10;

export interface LastViewedProduct {
  productId: string;
  timestamp: string; // ISO date string
}

/**
 * Hook for product suggestions and recommendations
 * Tracks user's browsing history for "Continue Where You Left Off"
 * Provides location and category-based recommendations
 * Ready for backend ML integration
 */
export function useProductSuggestions(products: Product[], userLocation?: string) {
  const [lastViewed, setLastViewed] = useState<LastViewedProduct[]>(() => {
    return loadLastViewed();
  });

  // Save last viewed to localStorage whenever it changes
  useEffect(() => {
    saveLastViewed(lastViewed);
  }, [lastViewed]);

  const trackProductView = useCallback((productId: bigint) => {
    const newView: LastViewedProduct = {
      productId: productId.toString(),
      timestamp: new Date().toISOString(),
    };

    setLastViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((v) => v.productId !== newView.productId);
      // Add to front
      const updated = [newView, ...filtered];
      // Keep only last MAX_LAST_VIEWED
      return updated.slice(0, MAX_LAST_VIEWED);
    });
  }, []);

  const getLastViewedProducts = useCallback(() => {
    return lastViewed
      .map((lv) => products.find((p) => p.id.toString() === lv.productId))
      .filter((p): p is Product => p !== undefined)
      .slice(0, 4); // Show max 4 in UI
  }, [lastViewed, products]);

  const getRecommendedProducts = useCallback(
    (limit: number = 6) => {
      if (!userLocation) {
        // No location, return random popular products
        return products
          .filter((p) => p.available && p.quantity > 0)
          .sort(() => Math.random() - 0.5)
          .slice(0, limit);
      }

      // Location-based: prioritize products from same location
      const localProducts = products.filter(
        (p) => p.available && p.quantity > 0
        // Note: We don't have location on product, so we'd need to join with farmer profile
        // For now, just return available products
      );

      return localProducts.slice(0, limit);
    },
    [products, userLocation]
  );

  const getSimilarProducts = useCallback(
    (product: Product, limit: number = 4) => {
      // Products from same category
      const sameCategory = products.filter(
        (p) =>
          p.id !== product.id &&
          p.category === product.category &&
          p.available &&
          p.quantity > 0
      );

      // Products from same farmer
      const sameFarmer = products.filter(
        (p) =>
          p.id !== product.id &&
          p.farmer.toString() === product.farmer.toString() &&
          p.available &&
          p.quantity > 0
      );

      // Prioritize same farmer, then same category
      const combined = [...new Set([...sameFarmer, ...sameCategory])];

      return combined.slice(0, limit);
    },
    [products]
  );

  const getSpecialOffers = useCallback(
    (limit: number = 4) => {
      // For now, return random organic products or newest products
      const organic = products.filter((p) => p.organic && p.available && p.quantity > 0);

      if (organic.length >= limit) {
        return organic.slice(0, limit);
      }

      // Fill with newest products
      const sorted = [...products]
        .filter((p) => p.available && p.quantity > 0)
        .sort((a, b) => Number(b.createdAt - a.createdAt));

      return sorted.slice(0, limit);
    },
    [products]
  );

  const getTrendingProducts = useCallback(
    (limit: number = 6) => {
      // Return newest products as "trending"
      return [...products]
        .filter((p) => p.available && p.quantity > 0)
        .sort((a, b) => Number(b.createdAt - a.createdAt))
        .slice(0, limit);
    },
    [products]
  );

  const clearHistory = useCallback(() => {
    setLastViewed([]);
    localStorage.removeItem(LAST_VIEWED_KEY);
  }, []);

  return {
    trackProductView,
    getLastViewedProducts,
    getRecommendedProducts,
    getSimilarProducts,
    getSpecialOffers,
    getTrendingProducts,
    clearHistory,
  };
}

function loadLastViewed(): LastViewedProduct[] {
  try {
    const stored = localStorage.getItem(LAST_VIEWED_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    // Filter out old views (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return parsed.filter((v: LastViewedProduct) => new Date(v.timestamp) > thirtyDaysAgo);
  } catch {
    return [];
  }
}

function saveLastViewed(lastViewed: LastViewedProduct[]): void {
  try {
    localStorage.setItem(LAST_VIEWED_KEY, JSON.stringify(lastViewed));
  } catch (error) {
    console.error('Failed to save last viewed:', error);
  }
}
