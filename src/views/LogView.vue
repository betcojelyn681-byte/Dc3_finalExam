<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ClipboardPenLine, Heart, Search, Trash2, PencilLine, ArrowRight } from 'lucide-vue-next'
import SymptomForm from '../components/SymptomForm.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import EmptyState from '../components/EmptyState.vue'
import { useCycleStore } from '../stores/cycle'
import { prettyDate } from '../utils/cycle'
const store = useCycleStore()
const router = useRouter()
const search = ref('')
const moodFilter = ref('All moods')
const confirmOpen = ref(false)
const confirmId = ref(null)
const logs = computed(() => store.data.logs.filter(l => {
  const q = search.value.toLowerCase()
  const match = !q || [l.date, l.mood, l.notes, ...l.symptoms].join(' ').toLowerCase().includes(q)
  return match && (moodFilter.value === 'All moods' || l.mood === moodFilter.value)
}))
function askDelete(log) { confirmOpen.value = true; confirmId.value = log.id }
function remove() { if (confirmId.value) store.deleteLog(confirmId.value); confirmOpen.value = false; confirmId.value = null }
function editLog(log) {
  store.selectedDate = log.date
  router.push('/log')
}
</script>
<template>
  <div class="page-stack">
    <section class="page-heading-row">
      <div>
        <p class="eyebrow">LISTEN TO YOURSELF</p>
        <h1>Daily check-in</h1>
        <p class="page-subtitle">Capture the little things: mood, flow, energy, and symptoms.</p>
      </div>
      <span class="heading-art-icon"><Heart :size="23" /></span>
    </section>
    <div class="log-page-grid">
      <section class="panel log-editor">
        <div class="panel-title-row">
          <div><h2>Your daily note</h2><p>A quick check-in, just for you</p></div>
          <span class="soft-icon"><ClipboardPenLine :size="19" /></span>
        </div>
        <SymptomForm />
      </section>
      <section class="panel log-history">
        <div class="panel-title-row">
          <div><h2>Check-in history</h2><p>{{ logs.length }} matching entries</p></div>
        </div>
        <div class="history-tools">
          <div class="search-field"><Search :size="16" /><input v-model="search" aria-label="Search check-ins" placeholder="Search notes or symptoms" /></div>
          <select v-model="moodFilter" aria-label="Filter by mood">
            <option>All moods</option>
            <option>Great</option><option>Good</option><option>Okay</option><option>Low</option><option>Anxious</option><option>Irritable</option>
          </select>
        </div>
        <div v-if="logs.length" class="log-history-list">
          <article v-for="log in logs" :key="log.id" class="history-card">
            <div class="history-card-top">
              <div>
                <small>{{ prettyDate(log.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) }}</small>
                <h3>{{ log.mood }} day</h3>
              </div>
              <div class="history-card-actions">
                <button class="icon-button" :aria-label="'Edit check-in for '+log.date" @click="editLog(log)"><PencilLine :size="15" /></button>
                <button class="icon-button danger-icon" :aria-label="'Delete check-in for '+log.date" @click="askDelete(log)"><Trash2 :size="16" /></button>
              </div>
            </div>
            <div class="history-meta">
              <span class="meta-pill">Flow: {{ log.flow }}</span>
              <span class="meta-pill">Energy: {{ log.energy }}</span>
            </div>
            <div v-if="log.symptoms.length" class="history-tags">
              <span v-for="symptom in log.symptoms" :key="symptom">{{ symptom }}</span>
            </div>
            <p v-if="log.notes" class="history-notes">{{ log.notes }}</p>
            <button class="inline-link" @click="store.selectedDate = log.date; router.push('/calendar')">View in calendar <ArrowRight :size="14" /></button>
          </article>
        </div>
        <EmptyState v-else illustration="♡" title="No check-ins found" message="Try another search or save your first daily note." />
      </section>
    </div>
    <p class="medical-note">Your entries are saved in this browser on this device. This demo does not use encrypted storage or a secure account system.</p>
    <ConfirmDialog
      v-model="confirmOpen"
      title="Delete check-in?"
      message="This will remove this daily check-in entry."
      confirm-label="Delete"
      cancel-label="Cancel"
      @confirm="remove"
    />
  </div>
</template>
