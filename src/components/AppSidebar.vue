<script setup>
import { CalendarDays, ChartNoAxesCombined, BookOpen, Settings2, HeartPulse, House, ClipboardPenLine, X, Flower2 } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
defineProps({ open: Boolean })
const emit = defineEmits(['close'])
const route = useRoute()
const router = useRouter()
const links = [
  { to: '/', label: 'Overview', icon: House },
  { to: '/calendar', label: 'My calendar', icon: CalendarDays },
  { to: '/log', label: 'Daily log', icon: ClipboardPenLine },
  { to: '/insights', label: 'Cycle insights', icon: ChartNoAxesCombined },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: Settings2 }
]
function navigate(to) { router.push(to); emit('close') }
</script>

<template>
  <div v-if="open" class="mobile-scrim" @click="emit('close')"></div>
  <aside class="sidebar" :class="{ 'sidebar-open': open }">
    <div class="brand">
      <div class="brand-mark"><HeartPulse :size="22" /></div>
      <div><strong>bloom</strong><span>cycle care</span></div>
      <button class="icon-button mobile-close" aria-label="Close menu" @click="emit('close')"><X :size="19" /></button>
    </div>
    <div class="side-label">YOUR SPACE</div>
    <nav class="side-nav" aria-label="Main navigation">
      <button v-for="link in links" :key="link.to" class="nav-link" :class="{ active: route.path === link.to }" @click="navigate(link.to)">
        <component :is="link.icon" :size="19" stroke-width="1.8" /><span>{{ link.label }}</span>
        <span v-if="route.path === link.to" class="active-dot"></span>
      </button>
    </nav>
    <div class="sidebar-bottom">
      <div class="support-card">
        <Flower2 class="support-flower" :size="25" stroke-width="1.8" aria-hidden="true" />
        <strong>Take it one day at a time.</strong>
        <p>Your cycle is personal. Your care can be, too.</p>
      </div>
      <div class="privacy-note"><span class="privacy-dot"></span> Saved on this device</div>
      <div class="sidebar-foot">BLOOM · STUDENT EDITION</div>
    </div>
  </aside>
</template>
