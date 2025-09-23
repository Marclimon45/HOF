<script lang="ts">
  import { authStore, loading } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { signOut } from 'firebase/auth';
  import { auth } from '$lib/firebase';
  
  // Redirect to home if user is not authenticated
  $: if (!$loading && !$authStore) {
    goto('/');
  }
  
  async function handleSignOut() {
    try {
      await signOut(auth);
      goto('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
</script>

{#if $loading}
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      <p class="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
{:else if $authStore}
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">CPX Lab</h1>
            <nav class="ml-10 flex space-x-8">
              <a href="/app" class="text-gray-700 hover:text-gray-900">Dashboard</a>
              <a href="/app/projects" class="text-gray-700 hover:text-gray-900">Projects</a>
              <a href="/app/people" class="text-gray-700 hover:text-gray-900">People</a>
              <a href="/app/ideas" class="text-gray-700 hover:text-gray-900">Ideas</a>
            </nav>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-gray-700">Welcome, {$authStore.displayName || $authStore.email}</span>
            <button 
              on:click={handleSignOut}
              class="text-gray-700 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
{/if}
