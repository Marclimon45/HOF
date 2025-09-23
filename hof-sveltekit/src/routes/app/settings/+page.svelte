<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth';
  import { userProfile } from '$lib/stores/userProfile';
  import { doc, updateDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { showToast } from '$lib/stores/toast';
  
  let loading = false;
  let activeTab = 'profile';
  
  // Profile settings
  let profileData = {
    firstName: '',
    lastName: '',
    bio: '',
    skills: [],
    avatarUrl: ''
  };
  
  // Integration settings
  let integrationData = {
    github: '',
    overleaf: '',
    googleDrive: '',
    discordHandle: '',
    orcid: '',
    scholar: ''
  };
  
  // Notification settings
  let notificationData = {
    emailNotifications: true,
    discordNotifications: true,
    projectUpdates: true,
    ideaUpdates: true,
    announcementNotifications: true
  };
  
  // New skill input
  let newSkill = '';
  
  onMount(async () => {
    if ($user && $userProfile) {
      loadUserData();
    }
  });
  
  function loadUserData() {
    if ($userProfile) {
      profileData = {
        firstName: $userProfile.firstName || '',
        lastName: $userProfile.lastName || '',
        bio: $userProfile.bio || '',
        skills: $userProfile.skills || [],
        avatarUrl: $userProfile.avatarUrl || ''
      };
      
      integrationData = {
        github: $userProfile.github || '',
        overleaf: $userProfile.overleaf || '',
        googleDrive: $userProfile.googleDrive || '',
        discordHandle: $userProfile.discordHandle || '',
        orcid: $userProfile.orcid || '',
        scholar: $userProfile.scholar || ''
      };
      
      notificationData = {
        emailNotifications: $userProfile.emailNotifications !== false,
        discordNotifications: $userProfile.discordNotifications !== false,
        projectUpdates: $userProfile.projectUpdates !== false,
        ideaUpdates: $userProfile.ideaUpdates !== false,
        announcementNotifications: $userProfile.announcementNotifications !== false
      };
    }
  }
  
  async function saveProfile() {
    try {
      loading = true;
      await updateDoc(doc(db, 'users', $user.uid), {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        bio: profileData.bio,
        skills: profileData.skills,
        avatarUrl: profileData.avatarUrl,
        updatedAt: new Date()
      });
      showToast('Success', 'Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Error', 'Failed to update profile. Please try again.', 'error');
    } finally {
      loading = false;
    }
  }
  
  async function saveIntegrations() {
    try {
      loading = true;
      await updateDoc(doc(db, 'users', $user.uid), {
        github: integrationData.github,
        overleaf: integrationData.overleaf,
        googleDrive: integrationData.googleDrive,
        discordHandle: integrationData.discordHandle,
        orcid: integrationData.orcid,
        scholar: integrationData.scholar,
        updatedAt: new Date()
      });
      showToast('Success', 'Integration settings updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating integrations:', error);
      showToast('Error', 'Failed to update integration settings. Please try again.', 'error');
    } finally {
      loading = false;
    }
  }
  
  async function saveNotifications() {
    try {
      loading = true;
      await updateDoc(doc(db, 'users', $user.uid), {
        emailNotifications: notificationData.emailNotifications,
        discordNotifications: notificationData.discordNotifications,
        projectUpdates: notificationData.projectUpdates,
        ideaUpdates: notificationData.ideaUpdates,
        announcementNotifications: notificationData.announcementNotifications,
        updatedAt: new Date()
      });
      showToast('Success', 'Notification settings updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating notifications:', error);
      showToast('Error', 'Failed to update notification settings. Please try again.', 'error');
    } finally {
      loading = false;
    }
  }
  
  function addSkill() {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      profileData.skills = [...profileData.skills, newSkill.trim()];
      newSkill = '';
    }
  }
  
  function removeSkill(skillToRemove: string) {
    profileData.skills = profileData.skills.filter(skill => skill !== skillToRemove);
  }
  
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      addSkill();
    }
  }
</script>

<svelte:head>
  <title>Settings - CPX Lab</title>
  <meta name="description" content="Manage your account settings and preferences" />
</svelte:head>

<div class="pt-16">
  <!-- Header -->
  <div class="bg-white border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
      <p class="text-lg text-gray-600 mt-2">Manage your account settings and preferences</p>
    </div>
  </div>
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col lg:flex-row gap-8">
      
      <!-- Settings Navigation -->
      <div class="lg:w-64">
        <nav class="space-y-1">
          <button 
            class="w-full text-left px-3 py-2 rounded-lg font-medium {activeTab === 'profile' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
            on:click={() => activeTab = 'profile'}
          >
            <i class="fas fa-user mr-2"></i>Profile
          </button>
          <button 
            class="w-full text-left px-3 py-2 rounded-lg font-medium {activeTab === 'integrations' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
            on:click={() => activeTab = 'integrations'}
          >
            <i class="fas fa-plug mr-2"></i>Integrations
          </button>
          <button 
            class="w-full text-left px-3 py-2 rounded-lg font-medium {activeTab === 'notifications' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
            on:click={() => activeTab = 'notifications'}
          >
            <i class="fas fa-bell mr-2"></i>Notifications
          </button>
          <button 
            class="w-full text-left px-3 py-2 rounded-lg font-medium {activeTab === 'access' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
            on:click={() => activeTab = 'access'}
          >
            <i class="fas fa-shield-alt mr-2"></i>Access
          </button>
        </nav>
      </div>
      
      <!-- Settings Content -->
      <div class="flex-1">
        
        {#if activeTab === 'profile'}
          <!-- Profile Settings -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            
            <form on:submit|preventDefault={saveProfile} class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text" 
                    id="firstName"
                    bind:value={profileData.firstName}
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName"
                    bind:value={profileData.lastName}
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              
              <div>
                <label for="bio" class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea 
                  id="bio"
                  bind:value={profileData.bio}
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>
              
              <div>
                <label for="avatarUrl" class="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
                <input 
                  type="url" 
                  id="avatarUrl"
                  bind:value={profileData.avatarUrl}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Skills & Interests</label>
                <div class="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    bind:value={newSkill}
                    on:keypress={handleKeyPress}
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Add a skill..."
                  />
                  <button type="button" on:click={addSkill} class="btn-secondary">
                    Add
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  {#each profileData.skills as skill}
                    <span class="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                      {skill}
                      <button type="button" on:click={() => removeSkill(skill)} class="ml-2 text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                      </button>
                    </span>
                  {/each}
                </div>
              </div>
              
              <div class="flex justify-end">
                <button type="submit" class="btn-primary" disabled={loading}>
                  {#if loading}
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                  {/if}
                  Save Profile
                </button>
              </div>
            </form>
          </div>
          
        {:else if activeTab === 'integrations'}
          <!-- Integration Settings -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">External Integrations</h2>
            
            <form on:submit|preventDefault={saveIntegrations} class="space-y-6">
              <div>
                <label for="github" class="block text-sm font-medium text-gray-700 mb-2">GitHub Profile</label>
                <input 
                  type="url" 
                  id="github"
                  bind:value={integrationData.github}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="https://github.com/username"
                />
              </div>
              
              <div>
                <label for="overleaf" class="block text-sm font-medium text-gray-700 mb-2">Overleaf Profile</label>
                <input 
                  type="url" 
                  id="overleaf"
                  bind:value={integrationData.overleaf}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="https://overleaf.com/profile"
                />
              </div>
              
              <div>
                <label for="googleDrive" class="block text-sm font-medium text-gray-700 mb-2">Google Drive Folder</label>
                <input 
                  type="url" 
                  id="googleDrive"
                  bind:value={integrationData.googleDrive}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="https://drive.google.com/drive/folders/..."
                />
              </div>
              
              <div>
                <label for="discordHandle" class="block text-sm font-medium text-gray-700 mb-2">Discord Handle</label>
                <input 
                  type="text" 
                  id="discordHandle"
                  bind:value={integrationData.discordHandle}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="username#1234"
                />
              </div>
              
              <div>
                <label for="orcid" class="block text-sm font-medium text-gray-700 mb-2">ORCID ID</label>
                <input 
                  type="url" 
                  id="orcid"
                  bind:value={integrationData.orcid}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="https://orcid.org/0000-0000-0000-0000"
                />
              </div>
              
              <div>
                <label for="scholar" class="block text-sm font-medium text-gray-700 mb-2">Google Scholar Profile</label>
                <input 
                  type="url" 
                  id="scholar"
                  bind:value={integrationData.scholar}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="https://scholar.google.com/citations?user=..."
                />
              </div>
              
              <div class="flex justify-end">
                <button type="submit" class="btn-primary" disabled={loading}>
                  {#if loading}
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                  {/if}
                  Save Integrations
                </button>
              </div>
            </form>
          </div>
          
        {:else if activeTab === 'notifications'}
          <!-- Notification Settings -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
            
            <form on:submit|preventDefault={saveNotifications} class="space-y-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Email Notifications</h3>
                    <p class="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" bind:checked={notificationData.emailNotifications} class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                  </label>
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Discord Notifications</h3>
                    <p class="text-sm text-gray-500">Receive notifications via Discord</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" bind:checked={notificationData.discordNotifications} class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                  </label>
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Project Updates</h3>
                    <p class="text-sm text-gray-500">Get notified about project changes</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" bind:checked={notificationData.projectUpdates} class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                  </label>
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Idea Updates</h3>
                    <p class="text-sm text-gray-500">Get notified about idea discussions</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" bind:checked={notificationData.ideaUpdates} class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                  </label>
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Announcements</h3>
                    <p class="text-sm text-gray-500">Get notified about lab announcements</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" bind:checked={notificationData.announcementNotifications} class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                  </label>
                </div>
              </div>
              
              <div class="flex justify-end">
                <button type="submit" class="btn-primary" disabled={loading}>
                  {#if loading}
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                  {/if}
                  Save Notifications
                </button>
              </div>
            </form>
          </div>
          
        {:else if activeTab === 'access'}
          <!-- Access Settings -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Access & Security</h2>
            
            <div class="space-y-6">
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-lg font-medium text-gray-900 mb-2">Account Information</h3>
                <div class="space-y-2 text-sm text-gray-600">
                  <div class="flex justify-between">
                    <span>Email:</span>
                    <span>{$user?.email}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Role:</span>
                    <span>{$userProfile?.role || 'Lab Member'}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Joined:</span>
                    <span>{$userProfile?.createdAt ? new Date($userProfile.createdAt).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                </div>
              </div>
              
              <div class="border border-red-200 rounded-lg p-4 bg-red-50">
                <h3 class="text-lg font-medium text-red-900 mb-2">Danger Zone</h3>
                <p class="text-sm text-red-700 mb-4">These actions cannot be undone.</p>
                <div class="space-y-3">
                  <button class="btn-secondary text-red-600 border-red-300 hover:bg-red-50">
                    <i class="fas fa-sign-out-alt mr-2"></i>Leave Lab
                  </button>
                  <button class="btn-secondary text-red-600 border-red-300 hover:bg-red-50">
                    <i class="fas fa-user-slash mr-2"></i>Request Role Change
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/if}
        
      </div>
    </div>
  </div>
</div>
