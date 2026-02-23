import { useState, useEffect, useCallback } from 'react';
import { ProductCategory } from '../backend';

const PREFERENCES_KEY = 'agrisync_userPreferences';

export interface UserPreferences {
  lastCategory?: ProductCategory | 'all';
  lastSortOrder?: 'newest' | 'price-low' | 'price-high' | 'name';
  organicPreference?: boolean;
}

/**
 * Hook for managing user preferences
 * Stores filter and sort preferences in localStorage
 * Ready for backend sync - just add API calls to save/load
 */
export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    return loadPreferences();
  });

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  const updateCategory = useCallback((category: ProductCategory | 'all') => {
    setPreferences((prev) => ({ ...prev, lastCategory: category }));
  }, []);

  const updateSortOrder = useCallback((sortOrder: UserPreferences['lastSortOrder']) => {
    setPreferences((prev) => ({ ...prev, lastSortOrder: sortOrder }));
  }, []);

  const updateOrganicPreference = useCallback((organicOnly: boolean) => {
    setPreferences((prev) => ({ ...prev, organicPreference: organicOnly }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences({});
    localStorage.removeItem(PREFERENCES_KEY);
  }, []);

  return {
    preferences,
    updateCategory,
    updateSortOrder,
    updateOrganicPreference,
    resetPreferences,
  };
}

function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function savePreferences(preferences: UserPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}
