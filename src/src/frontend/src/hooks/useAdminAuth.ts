import { useState, useCallback } from 'react';

// Simple admin session management (client-side for now)
// In production, this should be secured with backend session tokens

interface AdminSession {
  email: string;
  loggedInAt: number;
}

const ADMIN_SESSION_KEY = 'agrisync_admin_session';
const SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours

// Hardcoded admin credentials (as specified in requirements)
// NOTE: In production, this should be handled by backend authentication
const ADMIN_EMAIL = 'sunnytripathi735@gmail.com';
const ADMIN_PASSWORD = 'admin123'; // Placeholder password

export function useAdminAuth() {
  const [session, setSession] = useState<AdminSession | null>(() => {
    const stored = localStorage.getItem(ADMIN_SESSION_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AdminSession;
      // Check if session is expired
      if (Date.now() - parsed.loggedInAt < SESSION_TIMEOUT) {
        return parsed;
      }
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
    return null;
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simple validation (in production, this would call backend API)
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const newSession: AdminSession = {
        email,
        loggedInAt: Date.now(),
      };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(newSession));
      setSession(newSession);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setSession(null);
  }, []);

  const isAuthenticated = !!session;

  return {
    session,
    isAuthenticated,
    login,
    logout,
  };
}
