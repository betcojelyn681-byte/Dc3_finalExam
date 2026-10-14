<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import AppTopbar from './components/AppTopbar.vue'
import { useCycleStore } from './stores/cycle'
import { X, CheckCircle2, Heart } from 'lucide-vue-next'
const sidebarOpen = ref(false)
const route = useRoute()
const store = useCycleStore()
watch(() => route.path, () => { sidebarOpen.value = false })
</script>
<template>
  <div class="app-shell">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="main-shell">
      <AppTopbar @menu="sidebarOpen = true" />
      <main class="page-content"><RouterView /></main>
      <footer class="app-footer"><span>Bloom Cycle Care <span aria-hidden="true">·</span> Student project</span><span>Know your patterns, care for yourself <Heart class="footer-heart" :size="11" fill="currentColor" aria-hidden="true" /></span></footer>
    </div>
    <Transition name="toast"><div v-if="store.notice" class="toast-message"><CheckCircle2 :size="18" />{{ store.notice }}<button aria-label="Dismiss notification" @click="store.notice = ''"><X :size="15" /></button></div></Transition>
  </div>
</template>
