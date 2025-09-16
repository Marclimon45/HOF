import { writable } from 'svelte/store';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  return {
    subscribe,
    add: (toast: Omit<Toast, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: Toast = {
        id,
        duration: 5000,
        ...toast,
      };
      
      update(toasts => [...toasts, newToast]);
      
      // Auto remove after duration
      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          update(toasts => toasts.filter(t => t.id !== id));
        }, newToast.duration);
      }
      
      return id;
    },
    remove: (id: string) => {
      update(toasts => toasts.filter(t => t.id !== id));
    },
    clear: () => {
      update(() => []);
    }
  };
}

export const toasts = createToastStore();

// Helper functions for common toast types
export const showToast = (title: string, message: string, type: Toast['type'] = 'info', duration = 5000) => {
  return toasts.add({ title, message, type, duration });
};

export const showMessage = (title: string, message: string, isError = false) => {
  const type = isError ? 'error' : 'success';
  return showToast(title, message, type);
};