import { goto } from '$app/navigation';
import { user, loading } from './stores/auth';
import { get } from 'svelte/store';

/**
 * Authentication guard utility functions
 */

// Define public routes that don't require authentication
const publicRoutes = ['/', '/auth/signin', '/auth/signup'];

/**
 * Check if a route requires authentication
 * @param pathname - The pathname to check
 * @returns boolean indicating if authentication is required
 */
export function requiresAuth(pathname: string): boolean {
  // All /app/* routes require authentication
  if (pathname.startsWith('/app')) {
    return true;
  }
  // Any other route that's not in publicRoutes requires authentication
  return !publicRoutes.includes(pathname);
}

/**
 * Redirects to home page if user is not authenticated
 * @param redirectTo - Optional redirect path (defaults to '/')
 */
export function requireAuth(redirectTo: string = '/'): void {
  if (!$loading && !$user) {
    goto(redirectTo);
  }
}

/**
 * Redirects to app if user is already authenticated
 * @param redirectTo - Optional redirect path (defaults to '/app')
 */
export function requireGuest(redirectTo: string = '/app'): void {
  if (!$loading && $user) {
    goto(redirectTo);
  }
}

/**
 * Check if user is authenticated
 * @returns boolean indicating authentication status
 */
export function isAuthenticated(): boolean {
  return !$loading && !!$user;
}

/**
 * Check if user is not authenticated
 * @returns boolean indicating guest status
 */
export function isGuest(): boolean {
  return !$loading && !$user;
}

/**
 * Wait for auth state to be determined and then execute callback
 * @param callback - Function to execute once auth state is determined
 */
export function waitForAuth(callback: (isAuth: boolean) => void): void {
  const unsubscribe = loading.subscribe((isLoading) => {
    if (!isLoading) {
      callback(!!$user);
      unsubscribe();
    }
  });
}
