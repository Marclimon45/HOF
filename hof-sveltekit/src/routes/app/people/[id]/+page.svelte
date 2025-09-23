<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth';
  import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { page } from '$app/stores';
  
  let member = null;
  let memberProjects = [];
  let loading = true;
  
  $: memberId = $page.params.id;
  
  onMount(async () => {
    if ($user && memberId) {
      await loadMemberData();
    }
  });
  
  async function loadMemberData() {
    try {
      loading = true;
      
      // Load member details
      const memberDoc = await getDoc(doc(db, 'users', memberId));
      if (memberDoc.exists()) {
        member = {
          id: memberDoc.id,
          ...memberDoc.data()
        };
        
        // Load member's projects
        const projectsQuery = query(
          collection(db, 'projects'),
          where('members', 'array-contains', memberId)
        );
        const projectsSnapshot = await getDocs(projectsQuery);
        memberProjects = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }
      
    } catch (error) {
      console.error('Error loading member data:', error);
    } finally {
      loading = false;
    }
  }
  
  function formatDate(timestamp: any) {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  }
  
  function getRoleDisplay(role: string) {
    switch (role) {
      case 'pi': return 'Principal Investigator';
      case 'grad': return 'Graduate Student';
      case 'ug': return 'Undergraduate';
      case 'admin': return 'Admin';
      default: return 'Lab Member';
    }
  }
  
  function openExternalLink(url: string) {
    window.open(url, '_blank');
  }
</script>

<svelte:head>
  <title>{member?.displayName || 'Member'} - CPX Lab</title>
  <meta name="description" content={member?.bio || 'Lab member profile'} />
</svelte:head>

{#if loading}
  <div class="pt-16 flex items-center justify-center min-h-screen">
    <div class="text-center">
      <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
      <p class="mt-4 text-gray-600">Loading profile...</p>
    </div>
  </div>
{:else if !member}
  <div class="pt-16 flex items-center justify-center min-h-screen">
    <div class="text-center">
      <i class="fas fa-exclamation-triangle text-4xl text-gray-400"></i>
      <h1 class="mt-4 text-xl font-medium text-gray-900">Member not found</h1>
      <p class="mt-2 text-gray-600">The member you're looking for doesn't exist or you don't have access to their profile.</p>
      <a href="/app/people" class="btn-primary mt-4">Back to People</a>
    </div>
  </div>
{:else}
  <div class="pt-16">
    <!-- Profile Header -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-start space-x-6">
          <!-- Avatar -->
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            {#if member.avatarUrl}
              <img src={member.avatarUrl} alt={member.displayName} class="w-24 h-24 rounded-full object-cover" />
            {:else}
              <i class="fas fa-user text-gray-600 text-3xl"></i>
            {/if}
          </div>
          
          <!-- Profile Info -->
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900">{member.displayName || 'Anonymous User'}</h1>
            <p class="text-lg text-gray-600 mb-4">{getRoleDisplay(member.role)}</p>
            
            {#if member.bio}
              <p class="text-gray-700 leading-relaxed mb-6">{member.bio}</p>
            {/if}
            
            <!-- External Links -->
            <div class="flex items-center space-x-4">
              {#if member.github}
                <button 
                  class="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  on:click={() => openExternalLink(member.github)}
                >
                  <i class="fab fa-github"></i>
                  <span>GitHub</span>
                </button>
              {/if}
              {#if member.orcid}
                <button 
                  class="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  on:click={() => openExternalLink(member.orcid)}
                >
                  <i class="fas fa-id-card"></i>
                  <span>ORCID</span>
                </button>
              {/if}
              {#if member.scholar}
                <button 
                  class="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  on:click={() => openExternalLink(member.scholar)}
                >
                  <i class="fas fa-graduation-cap"></i>
                  <span>Google Scholar</span>
                </button>
              {/if}
              {#if member.discordHandle}
                <div class="flex items-center space-x-2 px-4 py-2 bg-indigo-100 rounded-lg">
                  <i class="fab fa-discord text-indigo-600"></i>
                  <span class="text-indigo-800">{member.discordHandle}</span>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Profile Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Skills & Interests -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Skills & Interests</h3>
            {#if member.skills && member.skills.length > 0}
              <div class="flex flex-wrap gap-2">
                {#each member.skills as skill}
                  <span class="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                    {skill}
                  </span>
                {/each}
              </div>
            {:else}
              <p class="text-gray-500">No skills listed</p>
            {/if}
          </div>
          
          <!-- Member Info -->
          <div class="bg-white rounded-lg border border-gray-200 p-6 mt-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Member Info</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Joined</span>
                <span class="text-gray-900">{formatDate(member.createdAt)}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Role</span>
                <span class="text-gray-900">{getRoleDisplay(member.role)}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Projects</span>
                <span class="text-gray-900">{memberProjects.length}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Current Projects -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">Current Projects</h3>
            
            {#if memberProjects.length === 0}
              <div class="text-center py-8">
                <i class="fas fa-project-diagram text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-600">No projects yet</p>
              </div>
            {:else}
              <div class="space-y-4">
                {#each memberProjects as project}
                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div class="flex-1">
                      <h4 class="font-medium text-gray-900 mb-1">{project.title}</h4>
                      <p class="text-sm text-gray-600 mb-2">{project.summary || project.description}</p>
                      <div class="flex items-center space-x-4 text-xs text-gray-500">
                        <span class="px-2 py-1 rounded-full bg-gray-200">
                          {project.status || 'Backlog'}
                        </span>
                        <span>{project.members?.length || 0} members</span>
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                    <a href="/app/projects/{project.id}" class="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      View Project
                    </a>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
        
      </div>
    </div>
  </div>
{/if}
