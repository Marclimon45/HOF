<script lang="ts">
  import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
  import { auth } from '$lib/firebase';
  import { goto } from '$app/navigation';
  
  let email = '';
  let password = '';
  let loading = false;
  let error = '';
  
  async function handleEmailSignIn() {
    if (!email || !password) {
      error = 'Please fill in all fields';
      return;
    }
    
    try {
      loading = true;
      error = '';
      await signInWithEmailAndPassword(auth, email, password);
      goto('/');
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
  
  async function handleGoogleSignIn() {
    try {
      loading = true;
      error = '';
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      goto('/');
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
  
  async function handleGithubSignIn() {
    try {
      loading = true;
      error = '';
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      goto('/');
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Sign In - CPX Lab</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-bold text-gray-900" style="font-size: var(--text-3xl);">
        Sign in to your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600" style="font-size: var(--text-sm);">
        Or
        <a href="/auth/signup" class="font-medium text-gray-900 hover:text-gray-700">
          create a new account
        </a>
      </p>
    </div>
    
    <form class="mt-8 space-y-6" on:submit|preventDefault={handleEmailSignIn}>
      {#if error}
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      {/if}
      
      <div class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700" style="font-size: var(--text-sm);">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            bind:value={email}
            required
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10"
            style="font-size: var(--text-base);"
            placeholder="Enter your email"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700" style="font-size: var(--text-sm);">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            bind:value={password}
            required
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10"
            style="font-size: var(--text-base);"
            placeholder="Enter your password"
          />
        </div>
      </div>
      
      <div>
        <button
          type="submit"
          disabled={loading}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          style="font-size: var(--text-base);"
        >
          {#if loading}
            <i class="fas fa-spinner fa-spin mr-2"></i>
          {/if}
          Sign in
        </button>
      </div>
      
      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-50 text-gray-500" style="font-size: var(--text-sm);">Or continue with</span>
          </div>
        </div>
        
        <div class="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            on:click={handleGoogleSignIn}
            disabled={loading}
            class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            style="font-size: var(--text-sm);"
          >
            <i class="fab fa-google mr-2"></i>
            Google
          </button>
          
          <button
            type="button"
            on:click={handleGithubSignIn}
            disabled={loading}
            class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            style="font-size: var(--text-sm);"
          >
            <i class="fab fa-github mr-2"></i>
            GitHub
          </button>
        </div>
      </div>
    </form>
  </div>
</div>
