<script lang="ts">
  import { authStore } from '$lib/stores/auth';
</script>

<svelte:head>
  <title>Dashboard - CPX Lab</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
    <p class="mt-2 text-gray-600">Welcome back, {$authStore?.displayName || $authStore?.email}!</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- Quick Actions -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
      <div class="space-y-3">
        <a href="/app/projects" class="block text-blue-600 hover:text-blue-800">View Projects</a>
        <a href="/app/people" class="block text-blue-600 hover:text-blue-800">Browse People</a>
        <a href="/app/ideas" class="block text-blue-600 hover:text-blue-800">Share Ideas</a>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
      <p class="text-gray-600">No recent activity to display.</p>
    </div>

    <!-- Profile Info -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Profile</h3>
      <div class="space-y-2">
        <p class="text-sm text-gray-600">
          <span class="font-medium">Email:</span> {$authStore?.email}
        </p>
        {#if $authStore?.displayName}
          <p class="text-sm text-gray-600">
            <span class="font-medium">Name:</span> {$authStore.displayName}
          </p>
        {/if}
      </div>
    </div>
  </div>
</div>
