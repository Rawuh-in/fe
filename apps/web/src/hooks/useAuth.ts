'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');

        if (!token && pathname !== '/login') {
          // No token and not on login page - redirect to login
          router.push('/login');
          setIsAuthenticated(false);
        } else if (token) {
          setIsAuthenticated(true);
        }

        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      router.push('/login');
    }
  };

  return { isAuthenticated, isLoading, logout };
}
