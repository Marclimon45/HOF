<script lang="ts">
  import { onMount } from 'svelte';
  import { user, loading } from '$lib/stores/auth';
  import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  
  let stats = {
    totalProjects: 0,
    activeMembers: 0,
    researchIdeas: 0,
    publications: 0
  };
  
  let featuredProjects = [];
  let recentActivity = [];
  let labInsights = [];
  
  onMount(async () => {
    if ($user) {
      await loadDashboardData();
    }
  });
  
  async function loadDashboardData() {
    try {
      // Load stats
      const projectsSnapshot = await getDocs(collection(db, 'projects'));
      stats.totalProjects = projectsSnapshot.size;
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      stats.activeMembers = usersSnapshot.size;
      
      const ideasSnapshot = await getDocs(collection(db, 'ideas'));
      stats.researchIdeas = ideasSnapshot.size;
      
      // Load featured projects
      const featuredQuery = query(
        collection(db, 'projects'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const featuredSnapshot = await getDocs(featuredQuery);
      featuredProjects = featuredSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Load recent activity
      const activityQuery = query(
        collection(db, 'activity'),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const activitySnapshot = await getDocs(activityQuery);
      recentActivity = activitySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Load lab insights
      const insightsQuery = query(
        collection(db, 'insights'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const insightsSnapshot = await getDocs(insightsQuery);
      labInsights = insightsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }
</script>

<svelte:head>
  <title>CPX Lab - Research Collaboration Platform</title>
  <meta name="description" content="Advancing research through collaboration and innovation. Join our community of researchers, engineers, and innovators." />
</svelte:head>

{#if $loading}
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
      <p class="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
{:else if $user}
  <!-- Logged-in Homepage -->
  <div class="pt-16">
    <!-- Hero Section -->
    <div class="bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-4" style="font-size: var(--text-4xl);">
            Welcome back, {$user.displayName || 'Researcher'}!
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
          <div class="stats-card">
            <div class="text-3xl font-bold text-gray-900 mb-2">{stats.totalProjects}</div>
            <div class="text-sm text-gray-600">Active Projects</div>
          </div>
          <div class="stats-card">
            <div class="text-3xl font-bold text-gray-900 mb-2">{stats.activeMembers}</div>
            <div class="text-sm text-gray-600">Lab Members</div>
          </div>
          <div class="stats-card">
            <div class="text-3xl font-bold text-gray-900 mb-2">{stats.researchIdeas}</div>
            <div class="text-sm text-gray-600">Research Ideas</div>
          </div>
          <div class="stats-card">
            <div class="text-3xl font-bold text-gray-900 mb-2">{stats.publications}</div>
            <div class="text-sm text-gray-600">Publications</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Featured Projects -->
          <div class="lg:col-span-2">
            <h2 class="text-2xl font-bold text-gray-900 mb-6" style="font-size: var(--text-2xl);">
              Featured Projects
            </h2>
            <div class="space-y-4">
              {#each featuredProjects as project}
                <div class="project-card">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center">
                      <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <i class="fas fa-project-diagram text-gray-600 text-xl"></i>
                      </div>
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-1" style="font-size: var(--text-lg);">
                          {project.title || 'Untitled Project'}
                        </h3>
                        <p class="text-sm text-gray-500" style="font-size: var(--text-sm);">
                          {project.category || 'General'}
                        </p>
                      </div>
                    </div>
                    <span class="status-badge status-{project.status?.toLowerCase() || 'active'}">
                      {project.status || 'Active'}
                    </span>
                  </div>
                  
                  <p class="text-gray-600 mb-4 line-clamp-3" style="font-size: var(--text-sm);">
                    {project.description || 'No description available'}
                  </p>
                  
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                      <span><i class="fas fa-users mr-1"></i>{project.members?.length || 0}</span>
                      <span><i class="fas fa-tasks mr-1"></i>{project.tasks?.length || 0}</span>
                    </div>
                    <a href="/projects" class="text-gray-600 hover:text-gray-900 font-medium" style="font-size: var(--text-sm);">
                      View Details
                    </a>
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Recent Activity -->
          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-6" style="font-size: var(--text-2xl);">
              Recent Activity
            </h2>
            <div class="space-y-4">
              {#each recentActivity as activity}
                <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <i class="fas fa-{activity.type === 'project' ? 'project-diagram' : 'lightbulb'} text-gray-600 text-sm"></i>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-900" style="font-size: var(--text-sm);">
                      {activity.description || 'New activity'}
                    </p>
                    <p class="text-xs text-gray-500" style="font-size: var(--text-xs);">
                      {activity.timestamp?.toDate?.()?.toLocaleDateString() || 'Recently'}
                    </p>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else}
  <!-- Guest Homepage -->
  <div class="pt-16">
    <!-- Hero Section -->
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
          <h1 class="text-5xl font-bold mb-6" style="font-size: var(--text-5xl);">
            Welcome to CPX Lab
          </h1>
          <p class="text-xl text-gray-300 mb-8 max-w-3xl mx-auto" style="font-size: var(--text-xl);">
            Advancing research through collaboration and innovation. Join our community of researchers, 
            engineers, and innovators working on cutting-edge projects.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth/signin" class="btn-primary">
              <i class="fas fa-sign-in-alt mr-2"></i>
              Sign In
            </a>
            <a href="/auth/signup" class="btn-secondary">
              <i class="fas fa-user-plus mr-2"></i>
              Join Lab
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="bg-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4" style="font-size: var(--text-3xl);">
            Why Choose CPX Lab?
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto" style="font-size: var(--text-lg);">
            Our platform provides everything you need to collaborate, innovate, and advance your research.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-project-diagram text-2xl text-gray-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2" style="font-size: var(--text-xl);">
              Project Management
            </h3>
            <p class="text-gray-600" style="font-size: var(--text-base);">
              Organize and track your research projects with our intuitive project management tools.
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-users text-2xl text-gray-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2" style="font-size: var(--text-xl);">
              Collaboration
            </h3>
            <p class="text-gray-600" style="font-size: var(--text-base);">
              Connect with fellow researchers and collaborate on groundbreaking projects.
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-lightbulb text-2xl text-gray-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2" style="font-size: var(--text-xl);">
              Innovation
            </h3>
            <p class="text-gray-600" style="font-size: var(--text-base);">
              Share ideas and discover new opportunities for research and development.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}