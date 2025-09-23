<script lang="ts">
  import { user } from '../stores/auth';
  import { userProfile, profileLoading } from '../stores/userProfile';
  import { page } from '$app/stores';
  import { signOut } from 'firebase/auth';
  import { auth } from '../firebase';
  import { createEventDispatcher } from 'svelte';
  import { showToast } from '../stores/toast';
  
  export let sidebarOpen = false;
  
  const dispatch = createEventDispatcher();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'fas fa-home', page: 'home' },
    { name: 'My Projects', href: '/projects', icon: 'fas fa-project-diagram', page: 'projects' },
    { name: 'Research Ideas', href: '/ideas', icon: 'fas fa-lightbulb', page: 'ideas' },
    { name: 'Lab Members', href: '/users', icon: 'fas fa-users', page: 'users' },
    { name: 'Lab Calendar', href: '#', icon: 'fas fa-calendar-alt', page: 'calendar' },
    { name: 'Progress Reports', href: '#', icon: 'fas fa-chart-line', page: 'reports' },
    { name: 'Settings', href: '#', icon: 'fas fa-cog', page: 'settings' },
  ];
  
  async function handleSignOut() {
    try {
      await signOut(auth);
      dispatch('userSignedOut');
      showToast('Signed Out', 'You have been successfully signed out.', 'info', 3000);
    } catch (error) {
      console.error('Error signing out:', error);
      showToast('Error', 'Failed to sign out. Please try again.', 'error');
    }
  }
  
  function isActive(href: string) {
    return $page.url.pathname === href;
  }
  
  function openModal(modalId: string) {
    dispatch('openModal', { modalId });
  }
  
  function getCurrentPageName() {
    const currentNav = navigation.find(nav => isActive(nav.href));
    return currentNav?.name || 'Dashboard';
  }
</script>

<!-- Sidebar Overlay -->
<div id="sidebar-overlay" class="sidebar-overlay {sidebarOpen ? 'open' : ''}"></div>

<!-- Left Sidebar -->
<div id="sidebar" class="sidebar {sidebarOpen ? 'open' : ''}">
        
    <!-- Breadcrumb Navigation -->
    <div id="breadcrumb" class="breadcrumb">
        <a href="/" class="breadcrumb-item">Home</a>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">{getCurrentPageName()}</span>
    </div>
    
    <!-- Sidebar Navigation -->
    <div class="sidebar-nav">
        {#each navigation as item}
            <a href={item.href} class="sidebar-nav-item {isActive(item.href) ? 'active' : ''}" data-page={item.page}>
                <i class={item.icon}></i>
                <span>{item.name}</span>
            </a>
        {/each}
    </div>
            
    <!-- User Info and Auth Buttons -->
    <div class="sidebar-footer">
        <div id="sidebar-user-info" class="sidebar-user-info {$user ? '' : 'hidden'}">
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-details">
                <div class="user-name" id="sidebar-user-name">
                  {#if $profileLoading}
                    Loading...
                  {:else if $userProfile?.firstName}
                    {$userProfile.firstName}
                  {:else}
                    {$user?.displayName || $user?.email || 'User'}
                  {/if}
                </div>
                <div class="user-role" id="sidebar-user-role">Researcher</div>
            </div>
        </div>
        
        <div id="sidebar-auth-buttons" class="sidebar-auth-buttons {$user ? 'hidden' : ''}">
            <button on:click={() => openModal('loginModal')} class="sidebar-btn sidebar-btn-primary">
                <i class="fas fa-sign-in-alt"></i>
                <span>Sign In</span>
            </button>
            <button on:click={() => openModal('registerModal')} class="sidebar-btn sidebar-btn-secondary">
                <i class="fas fa-user-plus"></i>
                <span>Apply to Lab</span>
            </button>
        </div>
        
        <div id="sidebar-logout-btn" class="sidebar-logout-btn {$user ? '' : 'hidden'}">
            <button on:click={handleSignOut} class="sidebar-btn sidebar-btn-logout">
                <i class="fas fa-sign-out-alt"></i>
                <span>Sign Out</span>
            </button>
        </div>
    </div>
</div>
