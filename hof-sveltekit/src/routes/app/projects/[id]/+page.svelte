<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth';
  import { doc, getDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { page } from '$app/stores';
  
  let project = null;
  let tasks = [];
  let activityLog = [];
  let loading = true;
  let activeTab = 'board';
  
  $: projectId = $page.params.id;
  
  onMount(async () => {
    if ($user && projectId) {
      await loadProjectData();
    }
  });
  
  async function loadProjectData() {
    try {
      loading = true;
      
      // Load project details
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (projectDoc.exists()) {
        project = {
          id: projectDoc.id,
          ...projectDoc.data()
        };
        
        // Load tasks for this project
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('projectId', '==', projectId),
          orderBy('createdAt', 'desc')
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        tasks = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Load activity log
        const activityQuery = query(
          collection(db, 'activityLog'),
          where('entityId', '==', projectId),
          orderBy('ts', 'desc')
        );
        const activitySnapshot = await getDocs(activityQuery);
        activityLog = activitySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }
      
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      loading = false;
    }
  }
  
  function getStatusClass(status: string) {
    switch (status) {
      case 'Backlog': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function formatDate(timestamp: any) {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  }
  
  function getTasksByStatus(status: string) {
    return tasks.filter(task => task.status === status);
  }
  
  function openExternalLink(url: string) {
    window.open(url, '_blank');
  }
</script>

<svelte:head>
  <title>{project?.title || 'Project'} - CPX Lab</title>
  <meta name="description" content={project?.summary || 'Research project details'} />
</svelte:head>

{#if loading}
  <div class="pt-16 flex items-center justify-center min-h-screen">
    <div class="text-center">
      <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
      <p class="mt-4 text-gray-600">Loading project...</p>
    </div>
  </div>
{:else if !project}
  <div class="pt-16 flex items-center justify-center min-h-screen">
    <div class="text-center">
      <i class="fas fa-exclamation-triangle text-4xl text-gray-400"></i>
      <h1 class="mt-4 text-xl font-medium text-gray-900">Project not found</h1>
      <p class="mt-2 text-gray-600">The project you're looking for doesn't exist or you don't have access to it.</p>
      <a href="/app/projects" class="btn-primary mt-4">Back to Projects</a>
    </div>
  </div>
{:else}
  <div class="pt-16">
    <!-- Project Header -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{project.title}</h1>
            <p class="text-lg text-gray-600 mt-2">{project.summary}</p>
            <div class="flex items-center space-x-4 mt-4">
              <span class="px-3 py-1 rounded-full text-sm font-medium {getStatusClass(project.status)}">
                {project.status}
              </span>
              <span class="text-sm text-gray-500">
                <i class="fas fa-users mr-1"></i>{project.members?.length || 0} members
              </span>
              <span class="text-sm text-gray-500">
                <i class="fas fa-tasks mr-1"></i>{tasks.length} tasks
              </span>
            </div>
          </div>
          <div class="flex space-x-3">
            <button class="btn-secondary">
              <i class="fas fa-edit mr-2"></i>Edit Project
            </button>
            <button class="btn-primary">
              <i class="fas fa-plus mr-2"></i>Add Task
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Tabs -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex space-x-8">
          <button 
            class="py-4 px-1 border-b-2 font-medium text-sm {activeTab === 'board' ? 'border-gray-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}"
            on:click={() => activeTab = 'board'}
          >
            Board
          </button>
          <button 
            class="py-4 px-1 border-b-2 font-medium text-sm {activeTab === 'overview' ? 'border-gray-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}"
            on:click={() => activeTab = 'overview'}
          >
            Overview
          </button>
          <button 
            class="py-4 px-1 border-b-2 font-medium text-sm {activeTab === 'links' ? 'border-gray-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}"
            on:click={() => activeTab = 'links'}
          >
            Links
          </button>
          <button 
            class="py-4 px-1 border-b-2 font-medium text-sm {activeTab === 'activity' ? 'border-gray-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}"
            on:click={() => activeTab = 'activity'}
          >
            Activity
          </button>
        </nav>
      </div>
    </div>
    
    <!-- Tab Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {#if activeTab === 'board'}
        <!-- Kanban Board -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Backlog -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 mb-4">Backlog</h3>
            <div class="space-y-3">
              {#each getTasksByStatus('Backlog') as task}
                <div class="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 class="font-medium text-gray-900 mb-2">{task.title}</h4>
                  <p class="text-sm text-gray-600 mb-3">{task.description || 'No description'}</p>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500">
                      {formatDate(task.createdAt)}
                    </span>
                    <span class="text-xs text-gray-500">
                      {task.assignees?.length || 0} assignees
                    </span>
                  </div>
                </div>
              {/each}
              {#if getTasksByStatus('Backlog').length === 0}
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-inbox text-2xl mb-2"></i>
                  <p>No tasks in backlog</p>
                </div>
              {/if}
            </div>
          </div>
          
          <!-- In Progress -->
          <div class="bg-blue-50 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 mb-4">In Progress</h3>
            <div class="space-y-3">
              {#each getTasksByStatus('In Progress') as task}
                <div class="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 class="font-medium text-gray-900 mb-2">{task.title}</h4>
                  <p class="text-sm text-gray-600 mb-3">{task.description || 'No description'}</p>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500">
                      {formatDate(task.updatedAt)}
                    </span>
                    <span class="text-xs text-gray-500">
                      {task.assignees?.length || 0} assignees
                    </span>
                  </div>
                </div>
              {/each}
              {#if getTasksByStatus('In Progress').length === 0}
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-play text-2xl mb-2"></i>
                  <p>No tasks in progress</p>
                </div>
              {/if}
            </div>
          </div>
          
          <!-- Done -->
          <div class="bg-green-50 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 mb-4">Done</h3>
            <div class="space-y-3">
              {#each getTasksByStatus('Done') as task}
                <div class="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 class="font-medium text-gray-900 mb-2">{task.title}</h4>
                  <p class="text-sm text-gray-600 mb-3">{task.description || 'No description'}</p>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500">
                      {formatDate(task.updatedAt)}
                    </span>
                    <span class="text-xs text-gray-500">
                      {task.assignees?.length || 0} assignees
                    </span>
                  </div>
                </div>
              {/each}
              {#if getTasksByStatus('Done').length === 0}
                <div class="text-center py-8 text-gray-500">
                  <i class="fas fa-check text-2xl mb-2"></i>
                  <p>No completed tasks</p>
                </div>
              {/if}
            </div>
          </div>
        </div>
        
      {:else if activeTab === 'overview'}
        <!-- Overview -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Description</h3>
              <p class="text-gray-600 leading-relaxed">
                {project.description || 'No description available for this project.'}
              </p>
            </div>
            
            <div class="bg-white rounded-lg border border-gray-200 p-6 mt-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Goals</h3>
              <p class="text-gray-600 leading-relaxed">
                {project.goals || 'No goals defined for this project.'}
              </p>
            </div>
          </div>
          
          <div>
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Tags</h3>
              <div class="flex flex-wrap gap-2">
                {#each project.tags || [] as tag}
                  <span class="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                    {tag}
                  </span>
                {/each}
                {#if !project.tags || project.tags.length === 0}
                  <p class="text-gray-500">No tags</p>
                {/if}
              </div>
            </div>
            
            <div class="bg-white rounded-lg border border-gray-200 p-6 mt-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Members</h3>
              <div class="space-y-3">
                {#each project.members || [] as memberId}
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <i class="fas fa-user text-gray-600"></i>
                    </div>
                    <span class="text-gray-900">Member {memberId}</span>
                  </div>
                {/each}
                {#if !project.members || project.members.length === 0}
                  <p class="text-gray-500">No members</p>
                {/if}
              </div>
            </div>
          </div>
        </div>
        
      {:else if activeTab === 'links'}
        <!-- Links -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">External Links</h3>
          
          <div class="space-y-6">
            <!-- GitHub Links -->
            {#if project.links?.githubUrls?.length > 0}
              <div>
                <h4 class="font-medium text-gray-900 mb-3 flex items-center">
                  <i class="fab fa-github mr-2"></i>GitHub Repositories
                </h4>
                <div class="space-y-2">
                  {#each project.links.githubUrls as url}
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span class="text-sm text-gray-600">{url}</span>
                      <button 
                        class="btn-secondary text-sm"
                        on:click={() => openExternalLink(url)}
                      >
                        Open
                      </button>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
            
            <!-- Overleaf Links -->
            {#if project.links?.overleafUrls?.length > 0}
              <div>
                <h4 class="font-medium text-gray-900 mb-3 flex items-center">
                  <i class="fas fa-file-code mr-2"></i>Overleaf Projects
                </h4>
                <div class="space-y-2">
                  {#each project.links.overleafUrls as url}
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span class="text-sm text-gray-600">{url}</span>
                      <button 
                        class="btn-secondary text-sm"
                        on:click={() => openExternalLink(url)}
                      >
                        Open
                      </button>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
            
            <!-- Google Drive Links -->
            {#if project.links?.driveUrls?.length > 0}
              <div>
                <h4 class="font-medium text-gray-900 mb-3 flex items-center">
                  <i class="fab fa-google-drive mr-2"></i>Google Drive Folders
                </h4>
                <div class="space-y-2">
                  {#each project.links.driveUrls as url}
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span class="text-sm text-gray-600">{url}</span>
                      <button 
                        class="btn-secondary text-sm"
                        on:click={() => openExternalLink(url)}
                      >
                        Open
                      </button>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
            
            {#if !project.links || (!project.links.githubUrls?.length && !project.links.overleafUrls?.length && !project.links.driveUrls?.length)}
              <div class="text-center py-8">
                <i class="fas fa-link text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-600">No external links added yet</p>
                <button class="btn-primary mt-4">
                  <i class="fas fa-plus mr-2"></i>Add Links
                </button>
              </div>
            {/if}
          </div>
        </div>
        
      {:else if activeTab === 'activity'}
        <!-- Activity Log -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">Activity Log</h3>
          
          {#if activityLog.length === 0}
            <div class="text-center py-8">
              <i class="fas fa-history text-4xl text-gray-300 mb-4"></i>
              <p class="text-gray-600">No activity recorded yet</p>
            </div>
          {:else}
            <div class="space-y-4">
              {#each activityLog as activity}
                <div class="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-gray-600 text-sm"></i>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-900">
                      <span class="font-medium">User {activity.actorId}</span>
                      {activity.type === 'task_created' && ' created a new task'}
                      {activity.type === 'task_updated' && ' updated a task'}
                      {activity.type === 'project_updated' && ' updated the project'}
                      {activity.type === 'link_added' && ' added a new link'}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      {formatDate(activity.ts)}
                    </p>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
