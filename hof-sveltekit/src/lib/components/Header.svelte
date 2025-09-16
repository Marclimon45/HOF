<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { user } from '../stores/auth';
  
  const dispatch = createEventDispatcher();
  
  function toggleSidebar() {
    dispatch('toggleSidebar');
  }
</script>

<!-- Top Header -->
<header id="top-header" class="top-header">
    <div class="header-content">
        <div class="header-logo">CPX Lab</div>
        <button id="sidebar-toggle" class="sidebar-toggle {$user ? '' : 'hidden'}" on:click={toggleSidebar}>
            <i class="fas fa-bars"></i>
        </button>
    </div>
</header>
