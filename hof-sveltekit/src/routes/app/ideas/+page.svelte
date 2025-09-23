<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth';
  import { collection, getDocs, query, orderBy } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  
  let ideas = [];
  let loading = true;
  let searchTerm = '';
  let tagFilter = '';
  let stageFilter = '';
  
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
  
  function getStageClass(stage: string) {
    switch (stage) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Under Discussion': return 'bg-yellow-100 text-yellow-800';
      case 'Selected': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  $: filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.pitch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag = !tagFilter || idea.tags?.includes(tagFilter);
    const matchesStage = !stageFilter || idea.stage === stageFilter;
    
    return matchesSearch && matchesTag && matchesStage;
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
        <h1 class="text-4xl font-bold text-gray-900 mb-4" style="font-size: var(--text-4xl);">Idea Board</h1>
        <p class="text-xl text-gray-600 mb-8" style="font-size: var(--text-xl);">Propose and discuss research ideas</p>
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
            bind:value={tagFilter}
            class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent" 
            style="font-size: var(--text-base);"
          >
            <option value="">All Tags</option>
            <option value="AI/ML">AI/ML</option>
            <option value="Data Science">Data Science</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile">Mobile</option>
            <option value="IoT">IoT</option>
            <option value="Security">Security</option>
            <option value="Research">Research</option>
          </select>
          <select 
            bind:value={stageFilter}
            class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent" 
            style="font-size: var(--text-base);"
          >
            <option value="">All Stages</option>
            <option value="New">New</option>
            <option value="Under Discussion">Under Discussion</option>
            <option value="Selected">Selected</option>
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
        <!-- Idea Board Columns -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- New Ideas -->
          <div class="bg-blue-50 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 mb-4 flex items-center">
              <i class="fas fa-lightbulb mr-2"></i>New Ideas
            </h3>
            <div class="space-y-3">
              {#each filteredIdeas.filter(idea => idea.stage === 'New') as idea}
                <div class="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 class="font-medium text-gray-900 mb-2">{idea.title || 'Untitled Idea'}</h4>
                  <p class="text-sm text-gray-600 mb-3">{idea.pitch || 'No pitch available'}</p>
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-xs text-gray-500">
                      <i class="fas fa-user mr-1"></i>{idea.proposerId || 'Anonymous'}
                    </span>
                    <span class="text-xs text-gray-500">
                      {idea.votes?.length || 0} votes
                    </span>
                  </div>
                  {#if idea.tags && idea.tags.length > 0}
                    <div class="flex flex-wrap gap-1 mb-3">
                      {#each idea.tags.slice(0, 2) as tag}
                        <span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          {tag}
                        </span>
                      {/each}
                    </div>
                  {/if}
                  <div class="flex items-center justify-between">
                    <button class="text-xs text-blue-600 hover:text-blue-800">
                      <i class="fas fa-thumbs-up mr-1"></i>Upvote
                    </button>
                    <button class="text-xs text-gray-600 hover:text-gray-800">
                      <i class="fab fa-discord mr-1"></i>Discuss
                    </button>
                  </div>
                </div>
              {/each}
              {#if filteredIdeas.filter(idea => idea.stage === 'New').length === 0}
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-lightbulb text-2xl mb-2"></i>
                  <p>No new ideas</p>
                </div>
              {/if}
            </div>
          </div>
          
          <!-- Under Discussion -->
          <div class="bg-yellow-50 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 mb-4 flex items-center">
              <i class="fas fa-comments mr-2"></i>Under Discussion
            </h3>
            <div class="space-y-3">
              {#each filteredIdeas.filter(idea => idea.stage === 'Under Discussion') as idea}
                <div class="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 class="font-medium text-gray-900 mb-2">{idea.title || 'Untitled Idea'}</h4>
                  <p class="text-sm text-gray-600 mb-3">{idea.pitch || 'No pitch available'}</p>
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-xs text-gray-500">
                      <i class="fas fa-user mr-1"></i>{idea.proposerId || 'Anonymous'}
                    </span>
                    <span class="text-xs text-gray-500">
                      {idea.votes?.length || 0} votes
                    </span>
                  </div>
                  {#if idea.tags && idea.tags.length > 0}
                    <div class="flex flex-wrap gap-1 mb-3">
                      {#each idea.tags.slice(0, 2) as tag}
                        <span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          {tag}
                        </span>
                      {/each}
                    </div>
                  {/if}
                  <div class="flex items-center justify-between">
                    <button class="text-xs text-green-600 hover:text-green-800">
                      <i class="fas fa-check mr-1"></i>Select
                    </button>
                    <button class="text-xs text-gray-600 hover:text-gray-800">
                      <i class="fab fa-discord mr-1"></i>Discuss
                    </button>
                  </div>
                </div>
              {/each}
              {#if filteredIdeas.filter(idea => idea.stage === 'Under Discussion').length === 0}
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-comments text-2xl mb-2"></i>
                  <p>No ideas under discussion</p>
                </div>
              {/if}
            </div>
          </div>
          
          <!-- Selected Ideas -->
          <div class="bg-green-50 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 mb-4 flex items-center">
              <i class="fas fa-check-circle mr-2"></i>Selected
            </h3>
            <div class="space-y-3">
              {#each filteredIdeas.filter(idea => idea.stage === 'Selected') as idea}
                <div class="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 class="font-medium text-gray-900 mb-2">{idea.title || 'Untitled Idea'}</h4>
                  <p class="text-sm text-gray-600 mb-3">{idea.pitch || 'No pitch available'}</p>
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-xs text-gray-500">
                      <i class="fas fa-user mr-1"></i>{idea.proposerId || 'Anonymous'}
                    </span>
                    <span class="text-xs text-gray-500">
                      {idea.votes?.length || 0} votes
                    </span>
                  </div>
                  {#if idea.tags && idea.tags.length > 0}
                    <div class="flex flex-wrap gap-1 mb-3">
                      {#each idea.tags.slice(0, 2) as tag}
                        <span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          {tag}
                        </span>
                      {/each}
                    </div>
                  {/if}
                  <div class="flex items-center justify-between">
                    <button class="text-xs text-blue-600 hover:text-blue-800">
                      <i class="fas fa-plus mr-1"></i>Create Project
                    </button>
                    <span class="text-xs text-green-600 font-medium">
                      <i class="fas fa-check mr-1"></i>Selected
                    </span>
                  </div>
                </div>
              {/each}
              {#if filteredIdeas.filter(idea => idea.stage === 'Selected').length === 0}
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-check-circle text-2xl mb-2"></i>
                  <p>No selected ideas</p>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
