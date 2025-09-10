<script lang="ts">
  import Header from './Header.svelte';
  import Sidebar from './Sidebar.svelte';
  import Footer from './Footer.svelte';
  import { user } from '../stores/auth';
  
  let sidebarOpen = false;
  
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
</script>

<div class="min-h-screen flex flex-col bg-white">
  <Header on:toggleSidebar={toggleSidebar} />
  
  <div class="flex flex-1">
    <Sidebar bind:sidebarOpen />
    
    <main class="main-content flex-1 flex flex-col">
      <slot />
    </main>
  </div>
  
  <Footer />
</div>
