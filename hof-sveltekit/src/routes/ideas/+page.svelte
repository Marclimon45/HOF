<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth';
  import { collection, getDocs, query, orderBy } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  
  let ideas = [];
  let loading = true;
  let searchTerm = '';
  let categoryFilter = '';
  let statusFilter = '';
  
  onMount(async () => {
    await loadIdeas();
  });
  
  async function loadIdeas() {
    try {
      loading = true;
      const ideasQuery = query(
        collection(db, 'ideas'),
        orderBy('createdAt', 'desc')
      );
      const ideasSnapshot = await getDocs(ideasQuery);
      ideas = ideasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error loading ideas:', error);
    } finally {
      loading = false;
    }
  }
  
  function formatDate(timestamp: any) {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  }
  
  function getStatusClass(status: string) {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Under Review': return 'bg-purple-100 text-purple-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  $: filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !categoryFilter || idea.category === categoryFilter;
    const matchesStatus = !statusFilter || idea.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
</script>

<svelte:head>
  <title>Research Ideas - CPX Lab</title>
  <meta name="description" content="Share and discover innovative research ideas" />
</svelte:head>

<div class="pt-16">
  <!-- Hero Section -->
  <div class="bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4" style="font-size: var(--text-4xl);">Research Ideas</h1>
        <p class="text-xl text-gray-600 mb-8" style="font-size: var(--text-xl);">Share and discover innovative research ideas</p>
        <div class="flex justify-center space-x-4">
          <button class="btn-primary">
            <i class="fas fa-plus mr-2"></i>Share an Idea
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Filter Section -->
  <div class="bg-white border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col lg:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <input 
              type="text" 
              bind:value={searchTerm}
              placeholder="Search ideas..." 
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
            <option value="Science">Science</option>
            <option value="Medicine">Medicine</option>
            <option value="Business">Business</option>
            <option value="Education">Education</option>
          </select>
          <select 
            bind:value={statusFilter}
            class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent" 
            style="font-size: var(--text-base);"
          >
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <!-- Ideas Section -->
  <div class="bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {#if loading}
        <div class="text-center py-12">
          <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
          <p class="mt-4 text-gray-600" style="font-size: var(--text-lg);">Loading ideas...</p>
        </div>
      {:else if filteredIdeas.length === 0}
        <div class="text-center py-12">
          <i class="fas fa-lightbulb text-6xl text-gray-300"></i>
          <h3 class="mt-4 text-xl font-medium text-gray-900" style="font-size: var(--text-xl);">No ideas found</h3>
          <p class="mt-2 text-gray-600" style="font-size: var(--text-lg);">Be the first to share a research idea!</p>
          <div class="mt-6">
            <button class="btn-primary">
              <i class="fas fa-plus mr-2"></i>Share an Idea
            </button>
          </div>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each filteredIdeas as idea}
            <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <i class="fas fa-lightbulb text-gray-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-1" style="font-size: var(--text-lg);">
                      {idea.title || 'Untitled Idea'}
                    </h3>
                    <p class="text-sm text-gray-500" style="font-size: var(--text-sm);">
                      {idea.category || 'General'}
                    </p>
                  </div>
                </div>
                <span class="px-2 py-1 rounded-full text-xs font-medium {getStatusClass(idea.status)}">
                  {idea.status || 'New'}
                </span>
              </div>
              
              <p class="text-gray-600 mb-4 line-clamp-3" style="font-size: var(--text-sm);">
                {idea.description || 'No description available'}
              </p>
              
              {#if idea.tags && idea.tags.length > 0}
                <div class="flex flex-wrap gap-2 mb-4">
                  {#each idea.tags.slice(0, 3) as tag}
                    <span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full" style="font-size: var(--text-xs);">
                      {tag}
                    </span>
                  {/each}
                  {#if idea.tags.length > 3}
                    <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full" style="font-size: var(--text-xs);">
                      +{idea.tags.length - 3} more
                    </span>
                  {/if}
                </div>
              {/if}
              
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <span><i class="fas fa-user mr-1"></i>{idea.author || 'Anonymous'}</span>
                  <span><i class="fas fa-calendar mr-1"></i>{formatDate(idea.createdAt)}</span>
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
