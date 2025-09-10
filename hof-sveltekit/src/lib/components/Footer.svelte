<script lang="ts">
  import { user } from '../stores/auth';
</script>

{#if $user}
  <!-- Logged-in Footer -->
  <footer class="bg-gray-50 border-t border-gray-200 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="col-span-1 md:col-span-2">
          <h3 class="text-lg font-semibold text-gray-900 mb-4" style="font-size: var(--text-lg);">
            CPX Lab
          </h3>
          <p class="text-gray-600 mb-4" style="font-size: var(--text-sm);">
            Advancing research through collaboration and innovation. Join our community of researchers, 
            engineers, and innovators working on cutting-edge projects.
          </p>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-400 hover:text-gray-600">
              <i class="fab fa-github text-xl"></i>
            </a>
            <a href="#" class="text-gray-400 hover:text-gray-600">
              <i class="fab fa-discord text-xl"></i>
            </a>
            <a href="#" class="text-gray-400 hover:text-gray-600">
              <i class="fab fa-linkedin text-xl"></i>
            </a>
          </div>
        </div>
        
        <div>
          <h4 class="text-sm font-semibold text-gray-900 mb-4" style="font-size: var(--text-sm);">
            Research
          </h4>
          <ul class="space-y-2">
            <li><a href="/projects" class="text-gray-600 hover:text-gray-900" style="font-size: var(--text-sm);">Projects</a></li>
            <li><a href="/ideas" class="text-gray-600 hover:text-gray-900" style="font-size: var(--text-sm);">Ideas</a></li>
            <li><a href="/publications" class="text-gray-600 hover:text-gray-900" style="font-size: var(--text-sm);">Publications</a></li>
            <li><a href="/resources" class="text-gray-600 hover:text-gray-900" style="font-size: var(--text-sm);">Resources</a></li>
          </ul>
        </div>
        
        <div>
          <h4 class="text-sm font-semibold text-gray-900 mb-4" style="font-size: var(--text-sm);">
            Community
          </h4>
          <ul class="space-y-2">
            <li><a href="/users" class="text-gray-600 hover:text-gray-900" style="font-size: var(--text-sm);">Members</a></li>
            <li><a href="/events" class="text-gray-600 hover:text-gray-900" style="font-size: var(--text-sm);">Events</a></li>
            <li><a href="/discussions" class="text-gray-600 hover:text-gray-900" style="font-size: var(--text-sm);">Discussions</a></li>
            <li><a href="/support" class="text-gray-600 hover:text-gray-900" style="font-size: var(--text-sm);">Support</a></li>
          </ul>
        </div>
      </div>
      
      <div class="border-t border-gray-200 mt-8 pt-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p class="text-gray-500" style="font-size: var(--text-sm);">
            © 2024 CPX Lab. All rights reserved.
          </p>
          <div class="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy" class="text-gray-500 hover:text-gray-900" style="font-size: var(--text-sm);">Privacy</a>
            <a href="/terms" class="text-gray-500 hover:text-gray-900" style="font-size: var(--text-sm);">Terms</a>
            <a href="/contact" class="text-gray-500 hover:text-gray-900" style="font-size: var(--text-sm);">Contact</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
{:else}
  <!-- Guest Footer -->
  <footer class="bg-gray-900 text-white mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="col-span-1 md:col-span-2">
          <h3 class="text-2xl font-bold mb-4" style="font-size: var(--text-2xl);">
            CPX Lab
          </h3>
          <p class="text-gray-300 mb-6" style="font-size: var(--text-lg);">
            Advancing research through collaboration and innovation. Join our community of researchers, 
            engineers, and innovators working on cutting-edge projects.
          </p>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-400 hover:text-white">
              <i class="fab fa-github text-2xl"></i>
            </a>
            <a href="#" class="text-gray-400 hover:text-white">
              <i class="fab fa-discord text-2xl"></i>
            </a>
            <a href="#" class="text-gray-400 hover:text-white">
              <i class="fab fa-linkedin text-2xl"></i>
            </a>
          </div>
        </div>
        
        <div>
          <h4 class="text-lg font-semibold mb-4" style="font-size: var(--text-lg);">
            Research
          </h4>
          <ul class="space-y-2">
            <li><a href="/projects" class="text-gray-300 hover:text-white" style="font-size: var(--text-base);">Projects</a></li>
            <li><a href="/ideas" class="text-gray-300 hover:text-white" style="font-size: var(--text-base);">Ideas</a></li>
            <li><a href="/publications" class="text-gray-300 hover:text-white" style="font-size: var(--text-base);">Publications</a></li>
            <li><a href="/resources" class="text-gray-300 hover:text-white" style="font-size: var(--text-base);">Resources</a></li>
          </ul>
        </div>
        
        <div>
          <h4 class="text-lg font-semibold mb-4" style="font-size: var(--text-lg);">
            Community
          </h4>
          <ul class="space-y-2">
            <li><a href="/users" class="text-gray-300 hover:text-white" style="font-size: var(--text-base);">Members</a></li>
            <li><a href="/events" class="text-gray-300 hover:text-white" style="font-size: var(--text-base);">Events</a></li>
            <li><a href="/discussions" class="text-gray-300 hover:text-white" style="font-size: var(--text-base);">Discussions</a></li>
            <li><a href="/support" class="text-gray-300 hover:text-white" style="font-size: var(--text-base);">Support</a></li>
          </ul>
        </div>
      </div>
      
      <div class="border-t border-gray-800 mt-8 pt-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p class="text-gray-400" style="font-size: var(--text-sm);">
            © 2024 CPX Lab. All rights reserved.
          </p>
          <div class="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy" class="text-gray-400 hover:text-white" style="font-size: var(--text-sm);">Privacy</a>
            <a href="/terms" class="text-gray-400 hover:text-white" style="font-size: var(--text-sm);">Terms</a>
            <a href="/contact" class="text-gray-400 hover:text-white" style="font-size: var(--text-sm);">Contact</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
{/if}
