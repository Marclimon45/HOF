<script lang="ts">
  import { toasts } from '../stores/toast';
  import { fade, fly } from 'svelte/transition';
  
  function getIcon(type: string) {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
      default:
        return 'fas fa-info-circle';
    }
  }
  
  function getTypeClass(type: string) {
    switch (type) {
      case 'success':
        return 'toast-success';
      case 'error':
        return 'toast-error';
      case 'warning':
        return 'toast-warning';
      case 'info':
      default:
        return 'toast-info';
    }
  }
  
  function removeToast(id: string) {
    toasts.remove(id);
  }
</script>

<!-- Toast Container -->
<div id="toast-container" class="fixed top-4 right-4 space-y-2" style="z-index: 9999;">
  {#each $toasts as toast (toast.id)}
    <div 
      class="toast {getTypeClass(toast.type)} show"
      in:fly={{ x: 300, duration: 300 }}
      out:fade={{ duration: 300 }}
    >
      <div class="toast-content">
        <div class="toast-icon">
          <i class={getIcon(toast.type)}></i>
        </div>
        <div class="toast-message">
          <div class="toast-title">{toast.title}</div>
          <div class="toast-text">{toast.message}</div>
        </div>
        <button 
          class="toast-close" 
          on:click={() => removeToast(toast.id)}
          aria-label="Close"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  {/each}
</div>

<style>
  :global(.toast) {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-left: 4px solid #3b82f6;
    padding: 16px;
    max-width: 400px;
    transform: translateX(100%);
    transition: transform 0.3s ease, opacity 0.3s ease;
    opacity: 0;
    font-family: system-ui, -apple-system, sans-serif;
  }

  :global(.toast.show) {
    transform: translateX(0);
    opacity: 1;
  }

  :global(.toast-success) {
    border-left-color: #10b981;
  }

  :global(.toast-error) {
    border-left-color: #ef4444;
  }

  :global(.toast-warning) {
    border-left-color: #f59e0b;
  }

  :global(.toast-info) {
    border-left-color: #3b82f6;
  }

  :global(.toast-content) {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  :global(.toast-icon) {
    font-size: 20px;
    margin-top: 2px;
  }

  :global(.toast-success .toast-icon) {
    color: #10b981;
  }

  :global(.toast-error .toast-icon) {
    color: #ef4444;
  }

  :global(.toast-warning .toast-icon) {
    color: #f59e0b;
  }

  :global(.toast-info .toast-icon) {
    color: #3b82f6;
  }

  :global(.toast-message) {
    flex: 1;
    min-width: 0;
  }

  :global(.toast-title) {
    font-weight: 600;
    font-size: 14px;
    color: #1f2937;
    margin-bottom: 4px;
  }

  :global(.toast-text) {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.4;
  }

  :global(.toast-close) {
    background: none;
    border: none;
    font-size: 14px;
    color: #9ca3af;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    margin-left: 8px;
    transition: background-color 0.2s;
    flex-shrink: 0;
  }

  :global(.toast-close:hover) {
    background-color: #f3f4f6;
    color: #6b7280;
  }
</style>