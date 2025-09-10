<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { createUserWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
  import { auth } from '../firebase';
  
  const dispatch = createEventDispatcher();
  
  export let isOpen = false;
  
  let name = '';
  let email = '';
  let password = '';
  let university = '';
  let major = '';
  let year = '';
  let experience = '';
  let interests = '';
  let error = '';
  let loading = false;
  
  function closeModal() {
    isOpen = false;
    dispatch('close');
  }
  
  async function handleRegister() {
    if (!name || !email || !password || !university || !major || !year) {
      error = 'Please fill in all required fields';
      return;
    }
    
    if (password.length < 6) {
      error = 'Password must be at least 6 characters';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });
      closeModal();
    } catch (err: any) {
      error = err.message || 'Failed to create account';
    } finally {
      loading = false;
    }
  }
  
  async function signInWithGoogle() {
    loading = true;
    error = '';
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      closeModal();
    } catch (err: any) {
      error = err.message || 'Failed to sign in with Google';
    } finally {
      loading = false;
    }
  }
  
  async function signInWithGitHub() {
    loading = true;
    error = '';
    
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      closeModal();
    } catch (err: any) {
      error = err.message || 'Failed to sign in with GitHub';
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

<!-- Register Modal -->
<div id="registerModal" class="modal {isOpen ? 'show' : ''}">
    <div class="modal-content max-w-md">
        <div class="modal-header">
            <h2 class="text-2xl font-bold text-slate-900">Join CPX Lab</h2>
            <p class="text-slate-600 text-sm mt-1">Apply to become a lab member</p>
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
                    <span class="px-3 bg-white text-slate-500 font-medium">or apply with email</span>
                </div>
            </div>
            
            <!-- Application Form -->
            <form on:submit|preventDefault={handleRegister} class="space-y-4">
                <div>
                    <label for="registerName" class="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                    <input 
                        type="text" 
                        id="registerName" 
                        bind:value={name}
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400"
                        placeholder="Enter your full name"
                        required
                        autocomplete="name"
                        disabled={loading}
                    >
                </div>
                <div>
                    <label for="registerEmail" class="block text-sm font-medium text-slate-700 mb-2">Email address</label>
                    <input 
                        type="email" 
                        id="registerEmail" 
                        bind:value={email}
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400"
                        placeholder="Enter your email"
                        required
                        autocomplete="email"
                        disabled={loading}
                    >
                </div>
                <div>
                    <label for="registerPassword" class="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <input 
                        type="password" 
                        id="registerPassword" 
                        bind:value={password}
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400"
                        placeholder="Create a password"
                        required
                        minlength="6"
                        autocomplete="new-password"
                        disabled={loading}
                    >
                </div>
                <div>
                    <label for="registerUniversity" class="block text-sm font-medium text-slate-700 mb-2">University</label>
                    <input 
                        type="text" 
                        id="registerUniversity" 
                        bind:value={university}
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400"
                        placeholder="Enter your university"
                        required
                        disabled={loading}
                    >
                </div>
                <div>
                    <label for="registerMajor" class="block text-sm font-medium text-slate-700 mb-2">Major/Field of Study</label>
                    <input 
                        type="text" 
                        id="registerMajor" 
                        bind:value={major}
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400"
                        placeholder="Enter your major"
                        required
                        disabled={loading}
                    >
                </div>
                <div>
                    <label for="registerYear" class="block text-sm font-medium text-slate-700 mb-2">Academic Year</label>
                    <select 
                        id="registerYear" 
                        bind:value={year}
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900"
                        required
                        disabled={loading}
                    >
                        <option value="">Select your academic year</option>
                        <option value="Freshman">Freshman</option>
                        <option value="Sophomore">Sophomore</option>
                        <option value="Junior">Junior</option>
                        <option value="Senior">Senior</option>
                        <option value="Graduate">Graduate Student</option>
                        <option value="PhD">PhD Student</option>
                        <option value="Postdoc">Postdoc</option>
                        <option value="Faculty">Faculty</option>
                    </select>
                </div>
                <div>
                    <label for="registerExperience" class="block text-sm font-medium text-slate-700 mb-2">Research Experience (Optional)</label>
                    <textarea 
                        id="registerExperience" 
                        bind:value={experience}
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400"
                        placeholder="Briefly describe your research experience"
                        rows="3"
                        disabled={loading}
                    ></textarea>
                </div>
                <div>
                    <label for="registerInterests" class="block text-sm font-medium text-slate-700 mb-2">Research Interests (Optional)</label>
                    <textarea 
                        id="registerInterests" 
                        bind:value={interests}
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400"
                        placeholder="What research areas interest you?"
                        rows="3"
                        disabled={loading}
                    ></textarea>
                </div>
                {#if error}
                    <div class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
                {/if}
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" on:click={closeModal} disabled={loading}>Cancel</button>
            <button type="button" class="btn btn-primary" on:click={handleRegister} disabled={loading}>
                <span class="btn-text">{loading ? 'Creating Account...' : 'Apply to Lab'}</span>
            </button>
        </div>
    </div>
</div>