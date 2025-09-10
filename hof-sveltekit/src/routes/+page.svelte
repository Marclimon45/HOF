<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import AboutSection from '$lib/components/AboutSection.svelte';
  import { user, loading } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  
  let stats = {
    totalProjects: 0,
    activeMembers: 0,
    researchIdeas: 0,
    publications: 0
  };
  
  onMount(async () => {
    // Load basic stats - in the original these were hardcoded
    stats = {
      totalProjects: 15,
      activeMembers: 25,
      researchIdeas: 42,
      publications: 8
    };
  });
  
  function openModal(event) {
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
              <div class="section-image image-placeholder">
                <div>
                  <i class="fas fa-handshake text-4xl mb-4"></i>
                  <div>Team Collaboration</div>
                  <div class="text-sm mt-2">Researchers working together on innovative projects</div>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div class="p-12 rounded-lg border border-gray-200 hover-lift slide-in-left">
                <div class="w-16 h-16 text-gray-900 rounded-lg flex items-center justify-center mb-8 text-2xl font-light">1</div>
                <h3 class="text-2xl font-light mb-6 text-gray-900" style="font-size: var(--text-2xl);">Apply to Lab</h3>
                <p class="text-gray-600 leading-relaxed mb-6 font-light" style="font-size: var(--text-lg);">Submit your research interests, CV, and academic background through our application portal.</p>
                <ul class="text-sm text-gray-500 space-y-3 font-light">
                  <li class="flex items-center"><span class="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>Research statement</li>
                  <li class="flex items-center"><span class="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>Academic transcripts</li>
                  <li class="flex items-center"><span class="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>Reference letters</li>
                </ul>
              </div>
              <div class="p-12 rounded-lg border border-gray-200 hover-lift fade-in">
                <div class="w-16 h-16 text-gray-900 rounded-lg flex items-center justify-center mb-8 text-2xl font-light">2</div>
                <h3 class="text-2xl font-light mb-6 text-gray-900" style="font-size: var(--text-2xl);">Interview Process</h3>
                <p class="text-gray-600 leading-relaxed mb-6 font-light" style="font-size: var(--text-lg);">Meet with lab members and discuss potential research projects and collaboration opportunities.</p>
                <ul class="text-sm text-gray-500 space-y-3 font-light">
                  <li class="flex items-center"><span class="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>Technical interview</li>
                  <li class="flex items-center"><span class="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>Research discussion</li>
                  <li class="flex items-center"><span class="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>Lab culture fit</li>
                </ul>
              </div>
              <div class="p-12 rounded-lg border border-gray-200 hover-lift slide-in-right">
                <div class="w-16 h-16 text-gray-900 rounded-lg flex items-center justify-center mb-8 text-2xl font-light">3</div>
                <h3 class="text-2xl font-light mb-6 text-gray-900" style="font-size: var(--text-2xl);">Onboard & Research</h3>
                <p class="text-gray-600 leading-relaxed mb-6 font-light" style="font-size: var(--text-lg);">Get access to our platform, join research projects, and start your academic journey with us.</p>
                <ul class="text-sm text-gray-500 space-y-3 font-light">
                  <li class="flex items-center"><span class="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>Platform training</li>
                  <li class="flex items-center"><span class="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>Project assignment</li>
                  <li class="flex items-center"><span class="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>Mentorship program</li>
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
  {:else}
    <!-- Logged-in user content -->
    <div class="pt-8">
      <!-- Welcome Section -->
      <div class="bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="text-center">
            <h1 class="text-4xl font-bold text-gray-900 mb-4" style="font-size: var(--text-4xl);">
              Welcome back, {$user.displayName || $user.email || 'Researcher'}!
            </h1>
            <p class="text-xl text-gray-600 mb-8" style="font-size: var(--text-xl);">
              Continue your research journey and collaborate with fellow innovators
            </p>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="text-center p-8 rounded-lg border border-gray-200 bg-white">
              <div class="text-3xl font-bold text-gray-900 mb-2">{stats.totalProjects}</div>
              <div class="text-sm text-gray-600">Active Projects</div>
            </div>
            <div class="text-center p-8 rounded-lg border border-gray-200 bg-white">
              <div class="text-3xl font-bold text-gray-900 mb-2">{stats.activeMembers}</div>
              <div class="text-sm text-gray-600">Lab Members</div>
            </div>
            <div class="text-center p-8 rounded-lg border border-gray-200 bg-white">
              <div class="text-3xl font-bold text-gray-900 mb-2">{stats.researchIdeas}</div>
              <div class="text-sm text-gray-600">Research Ideas</div>
            </div>
            <div class="text-center p-8 rounded-lg border border-gray-200 bg-white">
              <div class="text-3xl font-bold text-gray-900 mb-2">{stats.publications}</div>
              <div class="text-sm text-gray-600">Publications</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6" style="font-size: var(--text-2xl);">Quick Actions</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="/projects" class="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <i class="fas fa-project-diagram text-gray-600 text-xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">My Projects</h3>
              </div>
              <p class="text-gray-600">View and manage your active research projects</p>
            </a>
            
            <a href="/ideas" class="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <i class="fas fa-lightbulb text-gray-600 text-xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">Research Ideas</h3>
              </div>
              <p class="text-gray-600">Explore new research opportunities and ideas</p>
            </a>
            
            <a href="/users" class="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <i class="fas fa-users text-gray-600 text-xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">Lab Members</h3>
              </div>
              <p class="text-gray-600">Connect with other researchers in the lab</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  {/if}
{/if}