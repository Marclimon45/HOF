<script lang="ts">
  import Header from './Header.svelte';
  import Sidebar from './Sidebar.svelte';
  import LoginModal from './LoginModal.svelte';
  import RegisterModal from './RegisterModal.svelte';
  import { user } from '../stores/auth';
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
  $: mainContentClass = $user ? 'main-content with-sidebar' : 'main-content';
</script>

<div class="min-h-screen">
  <Header on:toggleSidebar={toggleSidebar} />
  
  <Sidebar 
    bind:sidebarOpen 
    on:openModal={openModal}
    on:userSignedOut={closeSidebar}
  />
  
  <!-- Main Content Wrapper -->
  <div id="main-content" class={mainContentClass}>
    <slot />
  </div>
  
  <!-- Modals -->
  <LoginModal bind:isOpen={loginModalOpen} on:close={closeModal} />
  <RegisterModal bind:isOpen={registerModalOpen} on:close={closeModal} />
</div>
