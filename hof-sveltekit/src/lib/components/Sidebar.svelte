<script lang="ts">
  import { user } from '../stores/auth';
  import { page } from '$app/stores';
  import { signOut } from 'firebase/auth';
  import { auth } from '../firebase';
  
  export let sidebarOpen = false;
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'fas fa-home' },
    { name: 'Projects', href: '/projects', icon: 'fas fa-project-diagram' },
    { name: 'Ideas', href: '/ideas', icon: 'fas fa-lightbulb' },
    { name: 'Community', href: '/users', icon: 'fas fa-users' },
  ];
  
  async function handleSignOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
  
  function isActive(href: string) {
    return $page.url.pathname === href;
  }
</script>

{#if $user}
  <aside class="sidebar {sidebarOpen ? 'block' : 'hidden lg:block'}">
    <!-- Breadcrumb Navigation -->
    <div class="px-4 py-3 border-b border-gray-200">
      <nav class="flex" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-2">
          <li>
            <a href="/" class="text-gray-500 hover:text-gray-700" style="font-size: var(--text-sm);">
              Home
            </a>
          </li>
          <li>
            <span class="text-gray-400" style="font-size: var(--text-sm);">/</span>
          </li>
          <li>
            <span class="text-gray-900 font-medium" style="font-size: var(--text-sm);">
              {navigation.find(nav => isActive(nav.href))?.name || 'Dashboard'}
            </span>
          </li>
        </ol>
      </nav>
    </div>
    
    <!-- Navigation Menu -->
    <nav class="mt-4">
      {#each navigation as item}
        <a
          href={item.href}
          class="sidebar-nav-item {isActive(item.href) ? 'active' : ''}"
        >
          <i class={item.icon}></i>
          <span>{item.name}</span>
        </a>
      {/each}
    </nav>
    
    <!-- User Info -->
    <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
      <div class="flex items-center mb-3">
        <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
          <i class="fas fa-user text-gray-600"></i>
        </div>
        <div>
          <div class="font-medium text-gray-900" style="font-size: var(--text-sm);">
            {$user.displayName || $user.email}
          </div>
          <div class="text-gray-500" style="font-size: var(--text-xs);">
            Lab Member
          </div>
        </div>
      </div>
      
      <button
        on:click={handleSignOut}
        class="w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        style="font-size: var(--text-sm);"
      >
        <i class="fas fa-sign-out-alt mr-2"></i>
        Sign Out
      </button>
    </div>
  </aside>
{/if}
