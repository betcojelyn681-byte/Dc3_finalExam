<script setup>
defineProps({
  illustration: { type: String, default: '✿' },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  compact: { type: Boolean, default: false },
  action: { type: String, default: '' },
  actionLabel: { type: String, default: 'Try again' }
})
const emit = defineEmits(['action'])
</script>

<template>
  <div class="empty-state" :class="{ compact }">
    <div class="empty-illustration">{{ illustration }}</div>
    <strong>{{ title }}</strong>
    <p v-if="message">{{ message }}</p>
    <button v-if="action" class="btn btn-secondary" @click="$emit('action')">{{ actionLabel }}</button>
  </div>
</template>
