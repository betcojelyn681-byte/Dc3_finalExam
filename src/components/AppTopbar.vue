<script setup>
import { Menu, Bell, ChevronDown } from 'lucide-vue-next'
import { useCycleStore } from '../stores/cycle'
import { ref } from 'vue'
const emit = defineEmits(['menu'])
const store = useCycleStore()
const showReminders = ref(false)
</script>

<template>
  <header class="topbar">
    <button class="icon-button menu-button" aria-label="Open navigation" @click="emit('menu')"><Menu :size="21" /></button>
    <div class="breadcrumb"><span>Bloom</span><span class="crumb-slash">/</span><strong>{{ $route.meta.title || 'Overview' }}</strong></div>
    <div class="topbar-actions">
      <div class="reminder-wrap">
        <button class="icon-button notification-button" aria-label="Show reminders" :aria-expanded="showReminders" @click="showReminders = !showReminders">
          <Bell :size="19" /><span v-if="store.data.profile.reminders && store.nextPeriod" class="notification-dot"></span>
        </button>
        <div v-if="showReminders" class="reminder-popover" role="status">
          <strong>Your gentle reminder</strong>
          <p v-if="!store.data.profile.reminders">Reminders are turned off in Settings.</p>
          <p v-else-if="store.nextPeriod">Your next period is estimated around {{ new Date(store.nextPeriod + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }}. Dates may vary.</p>
          <p v-else>Add a period start date to see an estimate.</p>
          <button class="text-button" @click="showReminders = false">Got it</button>
        </div>
      </div>
      <RouterLink to="/settings" class="profile-pill"><span class="avatar">{{ (store.data.profile.name || 'F').charAt(0).toUpperCase() }}</span><span class="profile-name">{{ store.data.profile.name || 'Friend' }}</span><ChevronDown :size="15" /></RouterLink>
    </div>
  </header>
</template>
