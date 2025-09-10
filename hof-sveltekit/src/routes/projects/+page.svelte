<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth';
  import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  
  let projects = [];
  let userProjects = [];
  let favoriteProjects = [];
  let loading = true;
  let searchTerm = '';
  let categoryFilter = '';
  let statusFilter = '';
  let sortBy = 'newest';
  
  let projectStats = {
    total: 0,
    active: 0,
    completed: 0,
    favorites: 0
  };
  
  onMount(async () => {
    if ($user) {
      await loadProjects();
    }
  });
  
  async function loadProjects() {
    try {
      loading = true;
      
      // Load user's own projects
      const userQuery = query(
        collection(db, 'projects'),
        where('createdBy', '==', $user.uid),
        orderBy('createdAt', 'desc')
      );
      const userSnapshot = await getDocs(userQuery);
      userProjects = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isOwner: true,
        isFavorite: false
      }));
      
      // Load favorite projects
      const favoriteQuery = query(
        collection(db, 'userFavorites'),
        where('userId', '==', $user.uid),
        where('type', '==', 'project')
      );
      const favoriteSnapshot = await getDocs(favoriteQuery);
      const favoriteIds = favoriteSnapshot.docs.map(doc => doc.data().itemId);
      
      if (favoriteIds.length > 0) {
        const favProjectsQuery = query(
          collection(db, 'projects'),
          where('__name__', 'in', favoriteIds)
        );
        const favProjectsSnapshot = await getDocs(favProjectsQuery);
        favoriteProjects = favProjectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isOwner: false,
          isFavorite: true
        }));
      }
      
      // Combine projects
      projects = [...userProjects, ...favoriteProjects];
      updateStats();
      
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      loading = false;
    }
  }
  
  function updateStats() {
    projectStats.total = projects.length;
    projectStats.active = projects.filter(p => p.status === 'Active').length;
    projectStats.completed = projects.filter(p => p.status === 'Completed').length;
    projectStats.favorites = projects.filter(p => p.isFavorite).length;
  }
  
  function getStatusClass(status: string) {
    switch (status) {
      case 'Active': return 'status-active';
      case 'Looking for Members': return 'status-looking';
      case 'Completed': return 'status-completed';
      case 'Archived': return 'status-archived';
      default: return 'status-active';
    }
  }
  
  function formatDate(timestamp: any) {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  }
  
  $: filteredProjects = projects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || project.category === categoryFilter;
    const matchesStatus = !statusFilter || project.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
</script>

<svelte:head>
  <title>My Projects - CPX Lab</title>
  <meta name="description" content="Manage and collaborate on your research projects" />
</svelte:head>

<div class="pt-16">
  <!-- Hero Section -->
  <div class="bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4" style="font-size: var(--text-4xl);">My Projects</h1>
        <p class="text-xl text-gray-600 mb-8" style="font-size: var(--text-xl);">Manage and collaborate on your research projects</p>
        <div class="flex justify-center space-x-4">
          <button class="btn-primary">
            <i class="fas fa-plus mr-2"></i>Create New Project
          </button>
          <button class="btn-secondary">
            <i class="fas fa-search mr-2"></i>Browse Projects
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Stats Section -->
  <div class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="stats-card">
          <div class="text-3xl font-bold text-gray-900 mb-2">{projectStats.total}</div>
          <div class="text-sm text-gray-600">Total Projects</div>
        </div>
        <div class="stats-card">
          <div class="text-3xl font-bold text-gray-900 mb-2">{projectStats.active}</div>
          <div class="text-sm text-gray-600">Active Projects</div>
        </div>
        <div class="stats-card">
          <div class="text-3xl font-bold text-gray-900 mb-2">{projectStats.completed}</div>
          <div class="text-sm text-gray-600">Completed</div>
        </div>
        <div class="stats-card">
          <div class="text-3xl font-bold text-gray-900 mb-2">{projectStats.favorites}</div>
          <div class="text-sm text-gray-600">Favorites</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Filter and Search Section -->
  <div class="bg-white border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col lg:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <input 
              type="text" 
              bind:value={searchTerm}
              placeholder="Search projects..." 
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent" 
              style="font-size: var(--text-base);"
            />
            <i class="fas fa-search absolute left-3 top-4 text-gray-400"></i>
          </div>
        </div>
        <div class="flex gap-3">
          <select 
            bind:value={categoryFilter}
            class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent" 
            style="font-size: var(--text-base);"
          >
            <option value="">All Categories</option>
            <option value="Technology">Technology</option>
            <option value="Engineering">Engineering</option>
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Business">Business</option>
            <option value="Research">Research</option>
          </select>
          <select 
            bind:value={statusFilter}
            class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent" 
            style="font-size: var(--text-base);"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Looking for Members">Looking for Members</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
          </select>
          <select 
            bind:value={sortBy}
            class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent" 
            style="font-size: var(--text-base);"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <!-- Projects Section -->
  <div class="bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {#if loading}
        <div class="text-center py-12">
          <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
          <p class="mt-4 text-gray-600" style="font-size: var(--text-lg);">Loading projects...</p>
        </div>
      {:else if filteredProjects.length === 0}
        <div class="text-center py-12">
          <i class="fas fa-folder-open text-6xl text-gray-300"></i>
          <h3 class="mt-4 text-xl font-medium text-gray-900" style="font-size: var(--text-xl);">No projects found</h3>
          <p class="mt-2 text-gray-600" style="font-size: var(--text-lg);">Get started by creating your first project or browse existing ones.</p>
          <div class="mt-6 space-x-4">
            <button class="btn-primary">
              <i class="fas fa-plus mr-2"></i>Create Project
            </button>
            <button class="btn-secondary">
              <i class="fas fa-search mr-2"></i>Browse Projects
            </button>
          </div>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each filteredProjects as project}
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
                <div class="flex items-center space-x-2">
                  {#if project.isFavorite}
                    <i class="fas fa-heart text-red-500"></i>
                  {/if}
                  {#if project.isOwner}
                    <i class="fas fa-crown text-yellow-500"></i>
                  {/if}
                </div>
              </div>
              
              <p class="text-gray-600 mb-4 line-clamp-3" style="font-size: var(--text-sm);">
                {project.description || 'No description available'}
              </p>
              
              <div class="flex items-center justify-between mb-4">
                <span class="status-badge {getStatusClass(project.status)}">
                  {project.status || 'Unknown'}
                </span>
                <span class="text-xs text-gray-500">
                  {formatDate(project.createdAt)}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <span><i class="fas fa-users mr-1"></i>{project.members?.length || 0}</span>
                  <span><i class="fas fa-tasks mr-1"></i>{project.tasks?.length || 0}</span>
                </div>
                <button class="text-gray-600 hover:text-gray-900 font-medium" style="font-size: var(--text-sm);">
                  View Details
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
