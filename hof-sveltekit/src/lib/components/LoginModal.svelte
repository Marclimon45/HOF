<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { signInWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
  import { auth } from '../firebase';
  import { showToast } from '../stores/toast';
  
  const dispatch = createEventDispatcher();
  
  export let isOpen = false;
  
  let email = '';
  let password = '';
  let error = '';
  let loading = false;
  
  function closeModal() {
    isOpen = false;
    // Clear form when closing
    email = '';
    password = '';
    error = '';
    loading = false;
    dispatch('close');
  }
  
  async function handleLogin() {
    if (!email || !password) {
      error = 'Please fill in all fields';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      closeModal();
      showToast('Welcome Back!', `Welcome back to CPX Lab, ${userCredential.user.displayName || email.split('@')[0]}!`, 'success', 4000);
      // Clear form
      email = '';
      password = '';
      error = '';
    } catch (err: any) {
      let errorMessage = 'An error occurred during sign in';
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No lab member found with this email address';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address';
          break;
        default:
          errorMessage = err.message || 'Failed to sign in';
      }
      error = errorMessage;
    } finally {
      loading = false;
    }
  }
  
  async function signInWithGoogle() {
    loading = true;
    error = '';
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      const result = await signInWithPopup(auth, provider);
      closeModal();
      showToast('Welcome to CPX Lab!', `Welcome back, ${result.user.displayName || 'Researcher'}!`, 'success', 4000);
    } catch (err: any) {
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again.';
      }
      
      showToast('Sign-in Error', errorMessage, 'error');
      error = errorMessage;
    } finally {
      loading = false;
    }
  }
  
  async function signInWithGitHub() {
    loading = true;
    error = '';
    
    try {
      const provider = new GithubAuthProvider();
      provider.addScope('user:email');
      const result = await signInWithPopup(auth, provider);
      closeModal();
      showToast('Welcome to CPX Lab!', `Welcome back, ${result.user.displayName || 'Researcher'}!`, 'success', 4000);
    } catch (err: any) {
      let errorMessage = 'Failed to sign in with GitHub. Please try again.';
      
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again.';
      }
      
      showToast('Sign-in Error', errorMessage, 'error');
      error = errorMessage;
    } finally {
      loading = false;
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Login Modal -->
<div id="loginModal" class="modal {isOpen ? 'show' : ''}">
    <div class="modal-content max-w-md">
        <div class="modal-header">
            <h2 class="text-2xl font-bold text-slate-900">Welcome Back</h2>
            <p class="text-slate-600 text-sm mt-1">Sign in to your CPX Lab account</p>
            <button class="close" on:click={closeModal}>&times;</button>
        </div>
        <div class="modal-body">
            <!-- Social Login Buttons -->
            <div class="space-y-3 mb-6">
                <button on:click={signInWithGoogle} disabled={loading} class="w-full flex items-center justify-center px-4 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700">
                    <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                </button>
                <button on:click={signInWithGitHub} disabled={loading} class="w-full flex items-center justify-center px-4 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700">
                    <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Continue with GitHub
                </button>
            </div>
            
            <!-- Divider -->
            <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-slate-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="px-3 bg-white text-slate-500 font-medium">or sign in with email</span>
                </div>
            </div>
            
            <!-- Email Form -->
            <form on:submit|preventDefault={handleLogin} class="space-y-4">
                <div>
                    <label for="loginEmail" class="block text-sm font-medium text-slate-700 mb-2">Email address</label>
                    <input 
                        type="email" 
                        id="loginEmail" 
                        bind:value={email}
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400"
                        placeholder="Enter your email"
                        required
                        autocomplete="email"
                        disabled={loading}
                    >
                </div>
                <div>
                    <label for="loginPassword" class="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <input 
                        type="password" 
                        id="loginPassword" 
                        bind:value={password}
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400"
                        placeholder="Enter your password"
                        required
                        autocomplete="current-password"
                        disabled={loading}
                    >
                </div>
                {#if error}
                    <div class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
                {/if}
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" on:click={closeModal} disabled={loading}>Cancel</button>
            <button type="button" class="btn btn-primary" on:click={handleLogin} disabled={loading}>
                <span class="btn-text">{loading ? 'Signing In...' : 'Sign In'}</span>
            </button>
        </div>
    </div>
</div>