import { writable } from 'svelte/store';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '$lib/firebase';

// Create auth store
export const authStore = writable<User | null>(null);
export const loading = writable(true);

// Initialize auth state listener
onAuthStateChanged(auth, (user) => {
  authStore.set(user);
  loading.set(false);
});

// Helper function to check if user is authenticated
export function isAuthenticated(): boolean {
  let user: User | null = null;
  authStore.subscribe(value => user = value)();
  return user !== null;
}
