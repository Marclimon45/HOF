<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth';
  import { collection, getDocs, query, orderBy } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  
  let projects = [];
  let loading = true;
  let searchTerm = '';
  let linkTypeFilter = '';
  
  onMount(async () => {
    if ($user) {
      await loadProjects();
    }
  });
  
  async function loadProjects() {
    try {
      loading = true;
      const projectsQuery = query(
        collection(db, 'projects'),
        orderBy('updatedAt', 'desc')
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      projects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      loading = false;
    }
  }
  
  function formatDate(timestamp: any) {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  }
  
  function openExternalLink(url: string) {
    window.open(url, '_blank');
  }
  
  function getAllLinks() {
    const allLinks = [];
    
    projects.forEach(project => {
      if (project.links) {
        // GitHub links
        if (project.links.githubUrls) {
          project.links.githubUrls.forEach(url => {
            allLinks.push({
              type: 'GitHub',
              url,
              projectTitle: project.title,
              projectId: project.id,
              icon: 'fab fa-github',
              color: 'text-gray-800',
              bgColor: 'bg-gray-100'
            });
          });
        }
        
        // Overleaf links
        if (project.links.overleafUrls) {
          project.links.overleafUrls.forEach(url => {
            allLinks.push({
              type: 'Overleaf',
              url,
              projectTitle: project.title,
              projectId: project.id,
              icon: 'fas fa-file-code',
              color: 'text-green-600',
              bgColor: 'bg-green-100'
            });
          });
        }
        
        // Google Drive links
        if (project.links.driveUrls) {
          project.links.driveUrls.forEach(url => {
            allLinks.push({
              type: 'Google Drive',
              url,
              projectTitle: project.title,
              projectId: project.id,
              icon: 'fab fa-google-drive',
              color: 'text-blue-600',
              bgColor: 'bg-blue-100'
            });
          });
        }
      }
    });
    
    return allLinks;
  }
  
  $: allLinks = getAllLinks();
  
  $: filteredLinks = allLinks.filter(link => {
    const matchesSearch = link.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !linkTypeFilter || link.type === linkTypeFilter;
    
    return matchesSearch && matchesType;
  });
  
  $: linksByType = {
    github: filteredLinks.filter(link => link.type === 'GitHub'),
    overleaf: filteredLinks.filter(link => link.type === 'Overleaf'),
    drive: filteredLinks.filter(link => link.type === 'Google Drive')
  };
</script>

<svelte:head>
  <title>Files & Links - CPX Lab</title>
  <meta name="description" content="Central hub for all external connections and files" />
</svelte:head>

<div class="pt-16">
  <!-- Hero Section -->
  <div class="bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4" style="font-size: var(--text-4xl);">Files & Links</h1>
        <p class="text-xl text-gray-600 mb-8" style="font-size: var(--text-xl);">Central hub for all external connections</p>
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
              placeholder="Search links..." 
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent" 
              style="font-size: var(--text-base);"
            />
            <i class="fas fa-search absolute left-3 top-4 text-gray-400"></i>
          </div>
        </div>
        <div class="flex gap-3">
          <select 
            bind:value={linkTypeFilter}
            class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent" 
            style="font-size: var(--text-base);"
          >
            <option value="">All Types</option>
            <option value="GitHub">GitHub</option>
            <option value="Overleaf">Overleaf</option>
            <option value="Google Drive">Google Drive</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <!-- Links Section -->
  <div class="bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {#if loading}
        <div class="text-center py-12">
          <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
          <p class="mt-4 text-gray-600" style="font-size: var(--text-lg);">Loading links...</p>
        </div>
      {:else if filteredLinks.length === 0}
        <div class="text-center py-12">
          <i class="fas fa-link text-6xl text-gray-300"></i>
          <h3 class="mt-4 text-xl font-medium text-gray-900" style="font-size: var(--text-xl);">No links found</h3>
          <p class="mt-2 text-gray-600" style="font-size: var(--text-lg);">Add links to your projects to see them here.</p>
        </div>
      {:else}
        <div class="space-y-8">
          
          <!-- GitHub Links -->
          {#if linksByType.github.length > 0}
            <div>
              <h2 class="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <i class="fab fa-github mr-3"></i>GitHub Repositories ({linksByType.github.length})
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each linksByType.github as link}
                  <div class="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex items-center">
                        <div class="w-10 h-10 {link.bgColor} rounded-lg flex items-center justify-center mr-3">
                          <i class="{link.icon} {link.color}"></i>
                        </div>
                        <div>
                          <h3 class="font-medium text-gray-900 text-sm">Repository</h3>
                          <p class="text-xs text-gray-500">GitHub</p>
                        </div>
                      </div>
                      <button 
                        class="text-gray-400 hover:text-gray-600"
                        on:click={() => openExternalLink(link.url)}
                      >
                        <i class="fas fa-external-link-alt"></i>
                      </button>
                    </div>
                    
                    <p class="text-sm text-gray-600 mb-3 break-all">{link.url}</p>
                    
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-gray-500">
                        From: <a href="/app/projects/{link.projectId}" class="text-blue-600 hover:text-blue-800">{link.projectTitle}</a>
                      </span>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- Overleaf Links -->
          {#if linksByType.overleaf.length > 0}
            <div>
              <h2 class="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <i class="fas fa-file-code mr-3"></i>Overleaf Projects ({linksByType.overleaf.length})
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each linksByType.overleaf as link}
                  <div class="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex items-center">
                        <div class="w-10 h-10 {link.bgColor} rounded-lg flex items-center justify-center mr-3">
                          <i class="{link.icon} {link.color}"></i>
                        </div>
                        <div>
                          <h3 class="font-medium text-gray-900 text-sm">Document</h3>
                          <p class="text-xs text-gray-500">Overleaf</p>
                        </div>
                      </div>
                      <button 
                        class="text-gray-400 hover:text-gray-600"
                        on:click={() => openExternalLink(link.url)}
                      >
                        <i class="fas fa-external-link-alt"></i>
                      </button>
                    </div>
                    
                    <p class="text-sm text-gray-600 mb-3 break-all">{link.url}</p>
                    
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-gray-500">
                        From: <a href="/app/projects/{link.projectId}" class="text-blue-600 hover:text-blue-800">{link.projectTitle}</a>
                      </span>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- Google Drive Links -->
          {#if linksByType.drive.length > 0}
            <div>
              <h2 class="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <i class="fab fa-google-drive mr-3"></i>Google Drive Folders ({linksByType.drive.length})
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each linksByType.drive as link}
                  <div class="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex items-center">
                        <div class="w-10 h-10 {link.bgColor} rounded-lg flex items-center justify-center mr-3">
                          <i class="{link.icon} {link.color}"></i>
                        </div>
                        <div>
                          <h3 class="font-medium text-gray-900 text-sm">Folder</h3>
                          <p class="text-xs text-gray-500">Google Drive</p>
                        </div>
                      </div>
                      <button 
                        class="text-gray-400 hover:text-gray-600"
                        on:click={() => openExternalLink(link.url)}
                      >
                        <i class="fas fa-external-link-alt"></i>
                      </button>
                    </div>
                    
                    <p class="text-sm text-gray-600 mb-3 break-all">{link.url}</p>
                    
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-gray-500">
                        From: <a href="/app/projects/{link.projectId}" class="text-blue-600 hover:text-blue-800">{link.projectTitle}</a>
                      </span>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
        </div>
      {/if}
    </div>
  </div>
</div>
