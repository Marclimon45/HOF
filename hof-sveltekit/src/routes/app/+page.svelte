<script lang="ts">
  import { user } from '$lib/stores/auth';
  import { userProfile } from '$lib/stores/userProfile';
  import { onMount } from 'svelte';
  import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  
  let myTasks = [];
  let myProjects = [];
  let latestAnnouncements = [];
  let loading = true;
  
  onMount(async () => {
    if ($user) {
      await loadDashboardData();
    }
  });
  
  async function loadDashboardData() {
    try {
      loading = true;
      
      // Load user's tasks (simplified - just get recent tasks from user's projects)
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('assignees', 'array-contains', $user.uid),
        orderBy('updatedAt', 'desc'),
        limit(5)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      myTasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Load user's projects
      const projectsQuery = query(
        collection(db, 'projects'),
        where('members', 'array-contains', $user.uid),
        orderBy('updatedAt', 'desc'),
        limit(6)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      myProjects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Load latest announcements
      const announcementsQuery = query(
        collection(db, 'announcements'),
        orderBy('publishAt', 'desc'),
        limit(3)
      );
      const announcementsSnapshot = await getDocs(announcementsQuery);
      latestAnnouncements = announcementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
</script>

<svelte:head>
  <title>Dashboard - CPX Lab</title>
  <meta name="description" content="Your personalized research portal dashboard" />
</svelte:head>

<div class="pt-16">
  <!-- Welcome Section -->
  <div class="bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {$userProfile?.firstName || $user?.displayName || 'Researcher'}!
          </h1>
          <p class="text-lg text-gray-600">
            Here's what's happening in your research world
          </p>
        </div>
        <div class="flex space-x-3">
          <a href="/app/projects" class="btn-primary">
            <i class="fas fa-plus mr-2"></i>New Project
          </a>
          <a href="/app/ideas" class="btn-secondary">
            <i class="fas fa-lightbulb mr-2"></i>New Idea
          </a>
        </div>
      </div>
    </div>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
    </div>
  {:else}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- My Tasks -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">My Tasks</h2>
              <a href="/app/projects" class="text-sm text-gray-600 hover:text-gray-900">
                View all projects
              </a>
            </div>
            
            {#if myTasks.length === 0}
              <div class="text-center py-8">
                <i class="fas fa-tasks text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-600">No tasks assigned to you yet</p>
                <a href="/app/projects" class="btn-primary mt-4">
                  Browse Projects
                </a>
              </div>
            {:else}
              <div class="space-y-4">
                {#each myTasks as task}
                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div class="flex-1">
                      <h3 class="font-medium text-gray-900">{task.title}</h3>
                      <p class="text-sm text-gray-600 mt-1">{task.description || 'No description'}</p>
                    </div>
                    <div class="flex items-center space-x-3">
                      <span class="px-2 py-1 rounded-full text-xs font-medium {getStatusClass(task.status)}">
                        {task.status}
                      </span>
                      <span class="text-xs text-gray-500">
                        {formatDate(task.updatedAt)}
                      </span>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
        
        <!-- Quick Links -->
        <div>
          <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
            <div class="space-y-3">
              <a href="#" class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <i class="fab fa-discord text-2xl text-indigo-600 mr-3"></i>
                <div>
                  <div class="font-medium text-gray-900">Discord</div>
                  <div class="text-sm text-gray-600">Lab chat & discussions</div>
                </div>
              </a>
              <a href="#" class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <i class="fab fa-github text-2xl text-gray-800 mr-3"></i>
                <div>
                  <div class="font-medium text-gray-900">GitHub Org</div>
                  <div class="text-sm text-gray-600">Code repositories</div>
                </div>
              </a>
              <a href="#" class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <i class="fas fa-file-code text-2xl text-green-600 mr-3"></i>
                <div>
                  <div class="font-medium text-gray-900">Overleaf Group</div>
                  <div class="text-sm text-gray-600">Research papers</div>
                </div>
              </a>
              <a href="#" class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <i class="fab fa-google-drive text-2xl text-blue-600 mr-3"></i>
                <div>
                  <div class="font-medium text-gray-900">Google Drive</div>
                  <div class="text-sm text-gray-600">Shared documents</div>
                </div>
              </a>
            </div>
          </div>
        </div>
        
        <!-- My Projects -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">My Projects</h2>
              <a href="/app/projects" class="text-sm text-gray-600 hover:text-gray-900">
                View all projects
              </a>
            </div>
            
            {#if myProjects.length === 0}
              <div class="text-center py-8">
                <i class="fas fa-project-diagram text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-600">You're not part of any projects yet</p>
                <a href="/app/projects" class="btn-primary mt-4">
                  Create Your First Project
                </a>
              </div>
            {:else}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each myProjects as project}
                  <a href="/app/projects/{project.id}" class="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <h3 class="font-medium text-gray-900 mb-2">{project.title}</h3>
                    <p class="text-sm text-gray-600 mb-3 line-clamp-2">{project.summary || project.description}</p>
                    <div class="flex items-center justify-between">
                      <span class="px-2 py-1 rounded-full text-xs font-medium {getStatusClass(project.status)}">
                        {project.status}
                      </span>
                      <span class="text-xs text-gray-500">
                        {project.members?.length || 0} members
                      </span>
                    </div>
                  </a>
                {/each}
              </div>
            {/if}
          </div>
        </div>
        
        <!-- Latest Announcements -->
        <div>
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900">Latest Announcements</h2>
              <a href="/app/announcements" class="text-sm text-gray-600 hover:text-gray-900">
                View all
              </a>
            </div>
            
            {#if latestAnnouncements.length === 0}
              <div class="text-center py-8">
                <i class="fas fa-bullhorn text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-600">No announcements yet</p>
              </div>
            {:else}
              <div class="space-y-4">
                {#each latestAnnouncements as announcement}
                  <div class="p-4 bg-gray-50 rounded-lg">
                    <h3 class="font-medium text-gray-900 mb-2">{announcement.title}</h3>
                    <p class="text-sm text-gray-600 mb-2 line-clamp-2">{announcement.body}</p>
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-gray-500">
                        {formatDate(announcement.publishAt)}
                      </span>
                      {#if announcement.pinned}
                        <i class="fas fa-thumbtack text-xs text-yellow-500"></i>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
        
      </div>
    </div>
  {/if}
</div>
