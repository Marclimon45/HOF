<script lang="ts">
  import Header from './Header.svelte';
  import Sidebar from './Sidebar.svelte';
  import LoginModal from './LoginModal.svelte';
  import RegisterModal from './RegisterModal.svelte';
  import Toast from './Toast.svelte';
  import { user } from '../stores/auth';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  
  let sidebarOpen = false;
  let loginModalOpen = false;
  let registerModalOpen = false;
  
  onMount(() => {
    // Listen for modal events from child components
    function handleOpenModal(event: CustomEvent) {
      const { modalId } = event.detail;
      if (modalId === 'loginModal') {
        loginModalOpen = true;
      } else if (modalId === 'registerModal') {
        registerModalOpen = true;
      }
    }
    
    document.addEventListener('openModal', handleOpenModal as EventListener);
    
    return () => {
      document.removeEventListener('openModal', handleOpenModal as EventListener);
    };
  });
  
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
  
  function closeSidebar() {
    sidebarOpen = false;
  }
  
  // Track previous path to detect navigation changes
  let previousPath = '';
  
  // Ensure sidebar closes when navigating to different routes
  $: if ($page && $page.url.pathname !== previousPath) {
    previousPath = $page.url.pathname;
    // Close sidebar when navigating to a different page
    sidebarOpen = false;
  }
  
  function openModal(event: CustomEvent) {
    const { modalId } = event.detail;
    if (modalId === 'loginModal') {
      loginModalOpen = true;
    } else if (modalId === 'registerModal') {
      registerModalOpen = true;
    }
  }
  
  function closeModal() {
    loginModalOpen = false;
    registerModalOpen = false;
  }
  
  // Update main content class based on user state and sidebar visibility
  // On desktop, sidebar is always visible when user is logged in
  // On mobile/tablet, sidebar visibility depends on sidebarOpen state
  $: mainContentClass = $user ? 'main-content with-sidebar' : 'main-content';
</script>

<div class="min-h-screen">
  <Header on:toggleSidebar={toggleSidebar} />
  
  {#if $user}
    <Sidebar 
      bind:sidebarOpen 
      on:openModal={openModal}
      on:userSignedOut={closeSidebar}
      on:closeSidebar={closeSidebar}
    />
  {/if}
  
  <!-- Main Content Wrapper -->
  <div id="main-content" class={mainContentClass}>
    <slot />
  </div>
  
  <!-- Modals -->
  <LoginModal bind:isOpen={loginModalOpen} on:close={closeModal} />
  <RegisterModal bind:isOpen={registerModalOpen} on:close={closeModal} />
  
  <!-- Toast Notifications -->
  <Toast />
</div>
