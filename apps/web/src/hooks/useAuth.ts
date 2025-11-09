'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser } from '@event-organizer/services';
import type { CurrentUserResponse } from '@event-organizer/services';

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUserResponse | null>(null);

  // Check if token exists
  const hasToken =
    typeof window !== 'undefined' ? !!localStorage.getItem('authToken') : false;

  // Fetch current user data when authenticated
  const { data: userData, isLoading: isUserLoading, error } = useCurrentUser(hasToken);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('authToken');
    const selectedProjectId = localStorage.getItem('selectedProjectId');

    // Public routes that don't require auth
    const publicRoutes = ['/login'];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!token && !isPublicRoute) {
      // No token and not on public route - redirect to login
      router.push('/login');
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    if (token && !isUserLoading) {
      if (error) {
        // Token invalid or expired - redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('selectedProjectId');
        router.push('/login');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      if (userData) {
        setCurrentUser(userData);
        setIsAuthenticated(true);

        // Handle project selection flow
        if (pathname === '/login') {
          // Just logged in, redirect to project selection
          router.push('/select-project');
        } else if (!selectedProjectId && pathname !== '/select-project') {
          // No project selected, redirect to selection page
          router.push('/select-project');
        }
      }

      setIsLoading(false);
    }
  }, [router, pathname, userData, isUserLoading, error, hasToken]);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('selectedProjectId');
      setCurrentUser(null);
      router.push('/login');
    }
  };

  return {
    isAuthenticated,
    isLoading: isLoading || isUserLoading,
    logout,
    currentUser,
    isSystemAdmin: currentUser?.user_type === 'SYSTEM_ADMIN',
  };
}
