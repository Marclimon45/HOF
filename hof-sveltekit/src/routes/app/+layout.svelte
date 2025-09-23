<script lang="ts">
  import { user, loading } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Header from '$lib/components/Header.svelte';
  import LoginModal from '$lib/components/LoginModal.svelte';
  import RegisterModal from '$lib/components/RegisterModal.svelte';
  import Toast from '$lib/components/Toast.svelte';
  
  let sidebarOpen = false;
  let showLoginModal = false;
  let showRegisterModal = false;
  
  onMount(() => {
    // Redirect to home if not authenticated
    if (!$loading && !$user) {
      goto('/');
    }
  });
  
  function handleOpenModal(event: CustomEvent) {
    const { modalId } = event.detail;
    if (modalId === 'loginModal') {
      showLoginModal = true;
    } else if (modalId === 'registerModal') {
      showRegisterModal = true;
    }
  }
  
  function handleCloseModal() {
    showLoginModal = false;
    showRegisterModal = false;
  }
  
  function handleUserSignedOut() {
    goto('/');
  }
  
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
</script>

<svelte:head>
  <title>CPX Lab - Research Portal</title>
</svelte:head>

{#if $loading}
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
      <p class="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
{:else if !$user}
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <i class="fas fa-lock text-4xl text-gray-400"></i>
      <p class="mt-4 text-gray-600">Please sign in to access the portal</p>
    </div>
  </div>
{:else}
  <div class="app-layout">
    <!-- Sidebar -->
    <Sidebar 
      bind:sidebarOpen 
      on:openModal={handleOpenModal}
      on:userSignedOut={handleUserSignedOut}
    />
    
    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <Header on:toggleSidebar={toggleSidebar} />
      
      <!-- Page Content -->
      <main class="page-content">
        <slot />
      </main>
    </div>
  </div>
  
  <!-- Modals -->
  {#if showLoginModal}
    <LoginModal on:close={handleCloseModal} />
  {/if}
  
  {#if showRegisterModal}
    <RegisterModal on:close={handleCloseModal} />
  {/if}
  
  <!-- Toast Notifications -->
  <Toast />
{/if}

<style>
  .app-layout {
    display: flex;
    min-height: 100vh;
    background-color: #f9fafb;
  }
  
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-left: 0;
    transition: margin-left 0.3s ease;
  }
  
  .page-content {
    flex: 1;
    padding: 0;
  }
  
  @media (min-width: 1024px) {
    .main-content {
      margin-left: 280px;
    }
  }
</style>
