<script setup>
defineProps({
  message: { type: String, default: 'Loading…' }
})
</script>

<template>
  <div class="loading-state" role="status" aria-live="polite">
    <div class="spinner"></div>
    <span>{{ message }}</span>
  </div>
</template>
