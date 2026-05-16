'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

export function AuthInitializer() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    // Auto-seed database if empty, then check auth
    async function init() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length === 0) {
          // Database is empty, seed it
          await fetch('/api/seed');
        }
      } catch {
        // Ignore seed errors
      }
      checkAuth();
    }
    init();
  }, [checkAuth]);

  return null;
}
