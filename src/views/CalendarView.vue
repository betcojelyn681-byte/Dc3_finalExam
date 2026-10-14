<script setup>
import { computed, ref } from 'vue'
import { Plus, Pencil, Trash2, CalendarDays, X } from 'lucide-vue-next'
import CalendarGrid from '../components/CalendarGrid.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import EmptyState from '../components/EmptyState.vue'
import { useCycleStore } from '../stores/cycle'
import { prettyDate, periodDuration } from '../utils/cycle'
const store = useCycleStore()
const month = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12))
const showForm = ref(false)
const confirmOpen = ref(false)
const confirmId = ref(null)
const editId = ref(null)
const start = ref(store.selectedDate)
const end = ref(store.selectedDate)
const notes = ref('')
const error = ref('')
const periods = computed(() => [...store.data.periods].sort((a, b) => b.start.localeCompare(a.start)))
function openNew() { editId.value = null; start.value = store.selectedDate; end.value = store.selectedDate; notes.value = ''; error.value = ''; showForm.value = true }
function openEdit(p) { editId.value = p.id; start.value = p.start; end.value = p.end; notes.value = p.notes || ''; error.value = ''; showForm.value = true }
function save() {
  const result = editId.value ? store.updatePeriod(editId.value, start.value, end.value, notes.value) : store.addPeriod(start.value, end.value, notes.value)
  if (!result.ok) { error.value = result.message; return }
  showForm.value = false
}
function askDelete(id) { confirmOpen.value = true; confirmId.value = id }
function remove() { if (confirmId.value) store.deletePeriod(confirmId.value); confirmOpen.value = false; confirmId.value = null }
</script>
<template>
  <div class="page-stack">
    <section class="page-heading-row">
      <div>
        <p class="eyebrow">YOUR MONTH, YOUR WAY</p>
        <h1>My calendar</h1>
        <p class="page-subtitle">A gentle overview of your period dates and daily notes.</p>
      </div>
      <button class="btn btn-primary" @click="openNew"><Plus :size="17" /> Add period</button>
    </section>
    <div class="calendar-page-grid">
      <div class="panel large-calendar">
        <CalendarGrid v-model="month" />
        <div class="selected-date-box">
          <div class="selected-date-icon"><CalendarDays :size="20" /></div>
          <div><small>Selected date</small><strong>{{ prettyDate(store.selectedDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) }}</strong></div>
          <button class="btn btn-secondary btn-small" @click="$router.push('/log')">Daily log</button>
        </div>
      </div>
      <div class="panel period-history">
        <div class="panel-title-row">
          <div><h2>Period history</h2><p>{{ periods.length }} {{ periods.length === 1 ? 'record' : 'records' }} saved</p></div>
          <span class="soft-icon"><CalendarDays :size="19" /></span>
        </div>
        <div v-if="periods.length" class="period-list">
          <article v-for="p in periods" :key="p.id" class="period-record">
            <span class="period-mark"></span>
            <div class="period-record-content">
              <strong>{{ prettyDate(p.start, { month: 'short', day: 'numeric', year: 'numeric' }) }}</strong>
              <p>Through {{ prettyDate(p.end, { month: 'short', day: 'numeric', year: 'numeric' }) }} · {{ periodDuration(p.start, p.end) }} days</p>
              <small v-if="p.notes">{{ p.notes }}</small>
            </div>
            <div class="record-actions">
              <button class="icon-button" :aria-label="'Edit period '+p.start" @click="openEdit(p)"><Pencil :size="15" /></button>
              <button class="icon-button danger-icon" :aria-label="'Delete period '+p.start" @click="askDelete(p.id)"><Trash2 :size="15" /></button>
            </div>
          </article>
        </div>
        <EmptyState v-else illustration="✿" title="Your story starts here" message="Add your period dates to see your calendar and future estimates." :action="true" action-label="Add first period" @action="openNew" />
      </div>
    </div>
    <div class="info-callout"><span>✦</span><p><strong>How predictions work</strong> Bloom estimates your next period using your most recent recorded start date and cycle length setting. Actual cycles can vary, so treat dates as a guide.</p></div>
    <ConfirmDialog
      v-model="confirmOpen"
      title="Delete period record?"
      message="This cannot be undone. The record will be removed from your calendar and history."
      confirm-label="Delete"
      cancel-label="Cancel"
      @confirm="remove"
    />
    <div v-if="showForm" class="modal-backdrop" @click.self="showForm = false">
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="period-modal-title">
        <div class="modal-heading">
          <div><p class="eyebrow">CYCLE RECORD</p><h2 id="period-modal-title">{{ editId ? 'Edit period dates' : 'Add period dates' }}</h2></div>
          <button class="icon-button" aria-label="Close" @click="showForm = false"><X :size="20" /></button>
        </div>
        <form @submit.prevent="save">
          <div class="form-grid-two">
            <div class="form-section"><label class="field-label" for="period-start">Start date</label><input id="period-start" v-model="start" type="date" required /></div>
            <div class="form-section"><label class="field-label" for="period-end">End date</label><input id="period-end" v-model="end" type="date" required /></div>
          </div>
          <div class="form-section"><label class="field-label" for="period-notes">Notes <span class="optional">· optional</span></label><textarea id="period-notes" v-model="notes" maxlength="240" rows="3" placeholder="Anything you'd like to remember…"></textarea></div>
          <p v-if="error" class="form-error">{{ error }}</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showForm = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Save period</button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>
