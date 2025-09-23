<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth';
  import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  
  let announcements = [];
  let loading = true;
  let searchTerm = '';
  let showPinnedOnly = false;
  
  onMount(async () => {
    if ($user) {
      await loadAnnouncements();
    }
  });
  
  async function loadAnnouncements() {
    try {
      loading = true;
      const announcementsQuery = query(
        collection(db, 'announcements'),
        orderBy('publishAt', 'desc')
      );
      const announcementsSnapshot = await getDocs(announcementsQuery);
      announcements = announcementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      loading = false;
    }
  }
  
  function formatDate(timestamp: any) {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  }
  
  function formatDateTime(timestamp: any) {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  }
  
  function isExpired(expiresAt: any) {
    if (!expiresAt) return false;
    const expiryDate = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
    return new Date() > expiryDate;
  }
  
  $: filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.body?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPinned = !showPinnedOnly || announcement.pinned;
    const notExpired = !isExpired(announcement.expiresAt);
    
    return matchesSearch && matchesPinned && notExpired;
  });
  
  $: pinnedAnnouncements = filteredAnnouncements.filter(a => a.pinned);
  $: regularAnnouncements = filteredAnnouncements.filter(a => !a.pinned);
</script>

<svelte:head>
  <title>Announcements - CPX Lab</title>
  <meta name="description" content="Lab announcements and important updates" />
</svelte:head>

<div class="pt-16">
  <!-- Hero Section -->
  <div class="bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4" style="font-size: var(--text-4xl);">Announcements</h1>
        <p class="text-xl text-gray-600 mb-8" style="font-size: var(--text-xl);">Important updates and lab events</p>
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
              placeholder="Search announcements..." 
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent" 
              style="font-size: var(--text-base);"
            />
            <i class="fas fa-search absolute left-3 top-4 text-gray-400"></i>
          </div>
        </div>
        <div class="flex gap-3">
          <label class="flex items-center">
            <input 
              type="checkbox" 
              bind:checked={showPinnedOnly}
              class="mr-2"
            />
            <span class="text-sm text-gray-700">Pinned only</span>
          </label>
        </div>
      </div>
    </div>
  </div>

  <!-- Announcements Section -->
  <div class="bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {#if loading}
        <div class="text-center py-12">
          <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
          <p class="mt-4 text-gray-600" style="font-size: var(--text-lg);">Loading announcements...</p>
        </div>
      {:else if filteredAnnouncements.length === 0}
        <div class="text-center py-12">
          <i class="fas fa-bullhorn text-6xl text-gray-300"></i>
          <h3 class="mt-4 text-xl font-medium text-gray-900" style="font-size: var(--text-xl);">No announcements found</h3>
          <p class="mt-2 text-gray-600" style="font-size: var(--text-lg);">Check back later for updates.</p>
        </div>
      {:else}
        <div class="space-y-6">
          
          <!-- Pinned Announcements -->
          {#if pinnedAnnouncements.length > 0}
            <div>
              <h2 class="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-thumbtack text-yellow-500 mr-2"></i>Pinned Announcements
              </h2>
              <div class="space-y-4">
                {#each pinnedAnnouncements as announcement}
                  <div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                    <div class="flex items-start justify-between mb-4">
                      <h3 class="text-xl font-semibold text-gray-900">{announcement.title}</h3>
                      <div class="flex items-center space-x-2">
                        <i class="fas fa-thumbtack text-yellow-500" title="Pinned"></i>
                        {#if announcement.notifyDiscord}
                          <i class="fab fa-discord text-indigo-500" title="Notified via Discord"></i>
                        {/if}
                      </div>
                    </div>
                    
                    <div class="prose max-w-none text-gray-700 mb-4">
                      {announcement.body}
                    </div>
                    
                    <div class="flex items-center justify-between text-sm text-gray-500">
                      <span>Published {formatDateTime(announcement.publishAt)}</span>
                      {#if announcement.expiresAt}
                        <span>Expires {formatDate(announcement.expiresAt)}</span>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- Regular Announcements -->
          {#if regularAnnouncements.length > 0}
            <div>
              {#if pinnedAnnouncements.length > 0}
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">Recent Announcements</h2>
              {/if}
              <div class="space-y-4">
                {#each regularAnnouncements as announcement}
                  <div class="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between mb-4">
                      <h3 class="text-xl font-semibold text-gray-900">{announcement.title}</h3>
                      <div class="flex items-center space-x-2">
                        {#if announcement.notifyDiscord}
                          <i class="fab fa-discord text-indigo-500" title="Notified via Discord"></i>
                        {/if}
                      </div>
                    </div>
                    
                    <div class="prose max-w-none text-gray-700 mb-4">
                      {announcement.body}
                    </div>
                    
                    <div class="flex items-center justify-between text-sm text-gray-500">
                      <span>Published {formatDateTime(announcement.publishAt)}</span>
                      {#if announcement.expiresAt}
                        <span>Expires {formatDate(announcement.expiresAt)}</span>
                      {/if}
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
