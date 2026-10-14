<script setup>
defineProps({ label: String, value: [String, Number], detail: String, icon: Object, tone: { type: String, default: 'rose' } })
</script>
<template>
  <article class="stat-card">
    <div class="stat-top"><span>{{ label }}</span><span class="stat-icon" :class="tone"><component v-if="icon" :is="icon" :size="18" /></span></div>
    <div class="stat-value">{{ value }}</div>
    <p>{{ detail }}</p>
  </article>
</template>
