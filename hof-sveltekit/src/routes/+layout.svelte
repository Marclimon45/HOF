<script lang="ts">
  import '../app.css';
</script>

<!-- Physics Background Animation -->
<div class="physics-background">
  <!-- Law of Levers -->
  <div class="lever-beam">
    <div class="lever-weight-left"></div>
    <div class="lever-weight-right"></div>
  </div>
  
  <!-- Center of Gravity -->
  <div class="center-gravity-triangle"></div>
  <div class="center-gravity-circle"></div>
  <div class="center-gravity-square"></div>
  
  <!-- Hydraulics & Fluid Flow -->
  <div class="hydraulic-wave"></div>
  <div class="fluid-droplet"></div>
  <div class="fluid-droplet"></div>
  <div class="fluid-droplet"></div>
  
  <!-- Geometric Lines -->
  <div class="geometric-line geometric-line-horizontal"></div>
  <div class="geometric-line geometric-line-vertical"></div>
  <div class="geometric-line geometric-line-diagonal"></div>
  
  <!-- Floating Shapes -->
  <div class="floating-shape floating-circle"></div>
  <div class="floating-shape floating-square"></div>
  <div class="floating-shape floating-triangle"></div>
</div>

<div class="min-h-screen bg-gray-50">
  <slot />
</div>