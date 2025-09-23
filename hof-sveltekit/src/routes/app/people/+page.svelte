<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth';
  import { collection, getDocs, query, orderBy } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  
  let users = [];
  let loading = true;
  let searchTerm = '';
  let roleFilter = '';
  
  onMount(async () => {
    await loadUsers();
  });
  
  async function loadUsers() {
    try {
      loading = true;
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      const usersSnapshot = await getDocs(usersQuery);
      users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      loading = false;
    }
  }
  
  function formatDate(timestamp: any) {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  }
  
  $: filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });
</script>

<svelte:head>
  <title>People - CPX Lab</title>
  <meta name="description" content="Lab member directory and profiles" />
</svelte:head>

<div class="pt-16">
  <!-- Hero Section -->
  <div class="bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4" style="font-size: var(--text-4xl);">People</h1>
        <p class="text-xl text-gray-600 mb-8" style="font-size: var(--text-xl);">Lab member directory and profiles</p>
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
              placeholder="Search members..." 
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent" 
              style="font-size: var(--text-base);"
            />
            <i class="fas fa-search absolute left-3 top-4 text-gray-400"></i>
          </div>
        </div>
        <div class="flex gap-3">
          <select 
            bind:value={roleFilter}
            class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent" 
            style="font-size: var(--text-base);"
          >
            <option value="">All Roles</option>
            <option value="pi">PI</option>
            <option value="grad">Graduate Student</option>
            <option value="ug">Undergraduate</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <!-- Users Section -->
  <div class="bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {#if loading}
        <div class="text-center py-12">
          <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
          <p class="mt-4 text-gray-600" style="font-size: var(--text-lg);">Loading members...</p>
        </div>
      {:else if filteredUsers.length === 0}
        <div class="text-center py-12">
          <i class="fas fa-users text-6xl text-gray-300"></i>
          <h3 class="mt-4 text-xl font-medium text-gray-900" style="font-size: var(--text-xl);">No members found</h3>
          <p class="mt-2 text-gray-600" style="font-size: var(--text-lg);">Try adjusting your search criteria.</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each filteredUsers as member}
            <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <i class="fas fa-user text-gray-600 text-xl"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900" style="font-size: var(--text-lg);">
                    {member.displayName || 'Anonymous User'}
                  </h3>
                  <p class="text-sm text-gray-500" style="font-size: var(--text-sm);">
                    {member.role === 'pi' ? 'Principal Investigator' : 
                     member.role === 'grad' ? 'Graduate Student' :
                     member.role === 'ug' ? 'Undergraduate' :
                     member.role === 'admin' ? 'Admin' : 'Lab Member'}
                  </p>
                </div>
              </div>
              
              <p class="text-gray-600 mb-4 line-clamp-3" style="font-size: var(--text-sm);">
                {member.bio || 'No bio available'}
              </p>
              
              <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span><i class="fas fa-calendar mr-1"></i>Joined {formatDate(member.createdAt)}</span>
                <span><i class="fas fa-project-diagram mr-1"></i>{member.projects?.length || 0} projects</span>
              </div>
              
              <div class="flex items-center justify-between mb-3">
                <div class="flex space-x-2">
                  {#if member.skills}
                    {#each member.skills.slice(0, 2) as skill}
                      <span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full" style="font-size: var(--text-xs);">
                        {skill}
                      </span>
                    {/each}
                    {#if member.skills.length > 2}
                      <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full" style="font-size: var(--text-xs);">
                        +{member.skills.length - 2} more
                      </span>
                    {/if}
                  {/if}
                </div>
                <a href="/app/people/{member.id}" class="text-gray-600 hover:text-gray-900 font-medium" style="font-size: var(--text-sm);">
                  View Profile
                </a>
              </div>
              
              <!-- External Links -->
              <div class="flex items-center space-x-2">
                {#if member.github}
                  <a href={member.github} target="_blank" class="text-gray-400 hover:text-gray-600">
                    <i class="fab fa-github"></i>
                  </a>
                {/if}
                {#if member.orcid}
                  <a href={member.orcid} target="_blank" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-id-card"></i>
                  </a>
                {/if}
                {#if member.scholar}
                  <a href={member.scholar} target="_blank" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-graduation-cap"></i>
                  </a>
                {/if}
                {#if member.discordHandle}
                  <span class="text-gray-400" title="Discord: {member.discordHandle}">
                    <i class="fab fa-discord"></i>
                  </span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
