<script lang="ts">
  import Layout from '$lib/components/Layout.svelte';
  import { user, loading } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import '../app.css';
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/auth/signin', '/auth/signup'];
  
  // Check if a route requires authentication
  function requiresAuth(pathname: string): boolean {
    // All /app/* routes require authentication
    if (pathname.startsWith('/app')) {
      return true;
    }
    // Any other route that's not in publicRoutes requires authentication
    return !publicRoutes.includes(pathname);
  }
  
  onMount(() => {
    // Check authentication status and redirect if needed
    const unsubscribe = loading.subscribe((isLoading) => {
      if (!isLoading) {
        const currentPath = $page.url.pathname;
        
        // If user is not authenticated and trying to access protected route
        if (!$user && requiresAuth(currentPath)) {
          goto('/');
        }
        
        // If user is authenticated and trying to access auth pages
        if ($user && (currentPath === '/auth/signin' || currentPath === '/auth/signup')) {
          goto('/app');
        }
      }
    });
    
    return unsubscribe;
  });
</script>

<Layout>
  <slot />
</Layout>