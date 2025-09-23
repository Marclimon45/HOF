<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import AboutSection from '$lib/components/AboutSection.svelte';
  import { user, loading } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  let stats = {
    totalProjects: 0,
    activeMembers: 0,
    researchIdeas: 0,
    publications: 0
  };
  
  onMount(async () => {
    // Redirect authenticated users to app
    if ($user) {
      goto('/app');
      return;
    }
    
    // Load basic stats - in the original these were hardcoded
    stats = {
      totalProjects: 15,
      activeMembers: 25,
      researchIdeas: 42,
      publications: 8
    };
  });
  
  function openModal(event: CustomEvent) {
    // Dispatch the modal event to the parent layout
    const modalEvent = new CustomEvent('openModal', { detail: event.detail });
    document.dispatchEvent(modalEvent);
  }
</script>

<svelte:head>
  <title>CPX Lab - Research Lab Management Platform</title>
  <meta name="description" content="Advanced research project management and student progress tracking for academic excellence" />
</svelte:head>

{#if $loading}
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
      <p class="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
{:else}
  <!-- Physics Background Animation -->
  <div class="physics-background">
    <!-- Law of Levers -->
    <div class="lever-system">
      <div class="lever-weight-left"></div>
      <div class="lever-weight-right"></div>
      <div class="lever-fulcrum"></div>
    </div>
    
    <!-- Center of Gravity Studies -->
    <div class="gravity-shapes">
      <div class="gravity-triangle"></div>
      <div class="gravity-circle"></div>
      <div class="gravity-square"></div>
    </div>
    
    <!-- Hydraulics & Fluid Flow -->
    <div class="fluid-flow">
      <div class="fluid-line-1"></div>
      <div class="fluid-line-2"></div>
      <div class="fluid-line-3"></div>
      <div class="fluid-pump"></div>
    </div>
    
    <!-- Geometric Grid -->
    <div class="geometric-grid">
      <div class="grid-line-h"></div>
      <div class="grid-line-h"></div>
      <div class="grid-line-h"></div>
      <div class="grid-line-v"></div>
      <div class="grid-line-v"></div>
    </div>
    
    <!-- Floating Particles -->
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
  </div>

  <Hero on:openModal={openModal} />
  
  {#if !$user}
    <!-- Dynamic Content Sections -->
    <div id="dynamic-content">
      <!-- Guest/Logged-out Content -->
      <div id="guest-content">
        <AboutSection />
        
        <!-- Lab Recruitment Section -->
        <section class="py-32">
          <div class="max-w-6xl mx-auto px-6">
            <div class="text-center mb-24">
              <h2 class="text-5xl font-light text-gray-900 mb-8" style="font-size: var(--text-5xl);">Join Our Research Community</h2>
              <p class="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light" style="font-size: var(--text-xl);">
                We're looking for passionate graduate students, postdocs, and researchers to join our cutting-edge research projects.
              </p>
            </div>
                  
            <!-- Team Collaboration Image -->
            <div class="mb-16">
              <div class="section-image">
                <img 
                  src="/images/CPXLabExample.png" 
                  alt="CPX Lab Research Environment" 
                  class="w-full h-full object-cover object-top rounded-lg"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div class="p-12 rounded-lg border border-gray-200 hover-lift slide-in-left">
                <div class="w-16 h-16 text-gray-900 rounded-lg flex items-center justify-center mb-8 text-2xl font-light">1</div>
                <h3 class="text-2xl font-light mb-6 text-gray-900" style="font-size: var(--text-2xl);">Meet Dr. Qin</h3>
                <p class="text-gray-600 leading-relaxed mb-6 font-light" style="font-size: var(--text-lg);">Schedule a meeting with Dr. Qin to discuss your research interests and learn about our lab's mission and ongoing projects.</p>
                <ul class="text-sm text-gray-500 space-y-3 font-light">
                  <li class="flex items-center"><span class="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>Initial consultation</li>
                  <li class="flex items-center"><span class="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>Research discussion</li>
                  <li class="flex items-center"><span class="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>Lab culture overview</li>
                </ul>
              </div>
              <div class="p-12 rounded-lg border border-gray-200 hover-lift fade-in">
                <div class="w-16 h-16 text-gray-900 rounded-lg flex items-center justify-center mb-8 text-2xl font-light">2</div>
                <h3 class="text-2xl font-light mb-6 text-gray-900" style="font-size: var(--text-2xl);">Submit Survey Form</h3>
                <p class="text-gray-600 leading-relaxed mb-6 font-light" style="font-size: var(--text-lg);">Complete our survey to help us understand your background, interests, and experience to find the best research match.</p>
                <ul class="text-sm text-gray-500 space-y-3 font-light">
                  <li class="flex items-center"><span class="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>Background assessment</li>
                  <li class="flex items-center"><span class="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>Research interests</li>
                  <li class="flex items-center"><span class="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>Experience evaluation</li>
                </ul>
              </div>
              <div class="p-12 rounded-lg border border-gray-200 hover-lift slide-in-right">
                <div class="w-16 h-16 text-gray-900 rounded-lg flex items-center justify-center mb-8 text-2xl font-light">3</div>
                <h3 class="text-2xl font-light mb-6 text-gray-900" style="font-size: var(--text-2xl);">Onboard & Have Fun</h3>
                <p class="text-gray-600 leading-relaxed mb-6 font-light" style="font-size: var(--text-lg);">Join our research community, get access to our platform, and start your exciting research journey with us.</p>
                <ul class="text-sm text-gray-500 space-y-3 font-light">
                  <li class="flex items-center"><span class="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>Platform access</li>
                  <li class="flex items-center"><span class="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>Research collaboration</li>
                  <li class="flex items-center"><span class="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>Fun learning experience</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        <!-- Integration Features Section -->
        <section class="py-32">
          <div class="max-w-6xl mx-auto px-6">
            <div class="text-center mb-24">
              <h2 class="text-5xl font-bold text-gray-900 mb-8" style="font-size: var(--text-5xl);">Seamless Integration Hub</h2>
              <p class="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-normal" style="font-size: var(--text-xl);">
                Connect your lab's most-used tools: GitHub, Discord, and Overleaf in one unified platform
              </p>
            </div>
            
            <!-- Integration Overview -->
            <div class="mb-16 p-8 rounded-lg border border-gray-200 bg-gray-50">
              <div class="flex items-center justify-center space-x-8 mb-6">
                <div class="flex items-center space-x-2">
                  <i class="fab fa-github text-3xl text-gray-600"></i>
                  <span class="text-lg font-bold text-gray-900">GitHub</span>
                </div>
                <div class="text-gray-400">+</div>
                <div class="flex items-center space-x-2">
                  <i class="fab fa-discord text-3xl text-gray-600"></i>
                  <span class="text-lg font-bold text-gray-900">Discord</span>
                </div>
                <div class="text-gray-400">+</div>
                <div class="flex items-center space-x-2">
                  <i class="fas fa-file-code text-3xl text-gray-600"></i>
                  <span class="text-lg font-bold text-gray-900">Overleaf</span>
                </div>
              </div>
              <p class="text-center text-gray-600 font-normal">All your research tools, unified in one place</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  {/if}
{/if}