<script lang="ts">
  import { user } from '../stores/auth';
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  function openModal(modalId: string) {
    dispatch('openModal', { modalId });
  }
</script>

<!-- Hero Section -->
<section id="home" class="text-gray-900 relative overflow-hidden">
    
    <div id="hero-content" class="max-w-6xl mx-auto px-6 py-32 relative z-20">
        <div class="text-center">
            <div class="inline-flex items-center px-3 py-1 rounded-full border border-gray-200 mb-12">
                <i class="fas fa-flask text-gray-600 mr-2" style="font-size: var(--text-sm);"></i>
                <span class="text-sm font-medium text-gray-600">Research Lab Management Platform</span>
            </div>
            <h1 class="text-6xl md:text-8xl font-bold mb-8 tracking-tight text-gray-900" id="hero-title" style="font-size: var(--text-8xl);">
                CPX Lab
            </h1>
            <p class="text-xl md:text-2xl mb-16 max-w-4xl mx-auto text-gray-700 font-normal leading-relaxed" id="hero-description" style="font-size: var(--text-2xl);">
                Advanced research project management and student progress tracking for academic excellence
            </p>
            <div id="hero-actions" class="flex flex-col sm:flex-row gap-6 justify-center mb-24">
                {#if $user}
                    <!-- Logged-in user actions -->
                    <a href="/projects" class="btn btn-primary">
                        <i class="fas fa-project-diagram mr-2"></i>
                        View My Projects
                    </a>
                    <a href="/ideas" class="btn btn-secondary">
                        <i class="fas fa-lightbulb mr-2"></i>
                        Browse Ideas
                    </a>
                {:else}
                    <!-- Guest user actions -->
                    <button on:click={() => openModal('loginModal')} class="btn btn-primary">
                        <i class="fas fa-sign-in-alt mr-2"></i>
                        Sign In
                    </button>
                    <button on:click={() => openModal('registerModal')} class="btn btn-secondary">
                        <i class="fas fa-user-plus mr-2"></i>
                        Apply to Lab
                    </button>
                {/if}
            </div>
            
            <!-- Lab Stats -->
            <div id="lab-stats" class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div class="text-center p-8 rounded-lg border border-gray-200 bg-white">
                    <div class="text-4xl font-bold text-gray-900 mb-3" style="font-size: var(--text-4xl);">15+</div>
                    <div class="text-gray-600 text-sm font-medium uppercase tracking-wide">Active Research Projects</div>
                </div>
                <div class="text-center p-8 rounded-lg border border-gray-200 bg-white">
                    <div class="text-4xl font-bold text-gray-900 mb-3" style="font-size: var(--text-4xl);">25+</div>
                    <div class="text-gray-600 text-sm font-medium uppercase tracking-wide">Graduate Students</div>
                </div>
                <div class="text-center p-8 rounded-lg border border-gray-200 bg-white">
                    <div class="text-4xl font-bold text-gray-900 mb-3" style="font-size: var(--text-4xl);">8+</div>
                    <div class="text-gray-600 text-sm font-medium uppercase tracking-wide">Publications</div>
                </div>
                <div class="text-center p-8 rounded-lg border border-gray-200 bg-white">
                    <div class="text-4xl font-bold text-gray-900 mb-3" style="font-size: var(--text-4xl);">3+</div>
                    <div class="text-gray-600 text-sm font-medium uppercase tracking-wide">Years Active</div>
                </div>
            </div>
        </div>
    </div>
</section>