<script lang="ts">
  import { user } from '../stores/auth';
  
  let sidebarOpen = false;
  
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
</script>

<header class="fixed top-0 left-0 right-0 h-16 bg-white z-50 flex items-center border-b border-gray-200">
  <div class="flex justify-between items-center w-full px-6">
    <div class="flex items-center">
      <a href="/" class="text-2xl font-bold text-gray-900" style="font-size: var(--text-2xl);">
        CPX Lab
      </a>
    </div>
    
    {#if $user}
      <button 
        on:click={toggleSidebar}
        class="lg:hidden p-2 text-gray-600 hover:text-gray-900"
      >
        <i class="fas fa-bars text-xl"></i>
      </button>
    {/if}
  </div>
</header>

<!-- Sidebar Overlay for Mobile -->
{#if $user && sidebarOpen}
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
    on:click={toggleSidebar}
  ></div>
{/if}
