<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { dateKey, makeMonthCells, monthLabel } from '../utils/cycle'
import { useCycleStore } from '../stores/cycle'
const props = defineProps({ compact: { type: Boolean, default: false } })
const emit = defineEmits(['select'])
const store = useCycleStore()
const month = defineModel({ type: Date, default: () => new Date() })
const year = computed(() => month.value.getFullYear())
const monthIndex = computed(() => month.value.getMonth())
const cells = computed(() => makeMonthCells(year.value, monthIndex.value))
const label = computed(() => monthLabel(month.value))
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
function move(amount) { month.value = new Date(year.value, monthIndex.value + amount, 1, 12) }
function keyFor(d) { return d ? dateKey(d) : '' }
function select(d) { if (d) { store.selectedDate = keyFor(d); emit('select', keyFor(d)) } }
function stateFor(d) {
  if (!d) return ''
  const key = keyFor(d)
  if (store.isPeriodDate(key)) return 'period-day'
  if (store.isPredictedDate(key)) return 'predicted-day'
  if (store.isEstimatedOvulation(key)) return 'ovulation-day'
  return ''
}
</script>
<template>
  <section class="calendar-widget" :class="{ compact }">
    <div class="calendar-head">
      <div><h3>{{ label }}</h3><p>{{ compact ? 'A little look at your month' : 'Select a date to view or add a check-in' }}</p></div>
      <div class="calendar-arrows">
        <button class="icon-button" aria-label="Previous month" @click="move(-1)"><ChevronLeft :size="18" /></button>
        <button class="icon-button" aria-label="Next month" @click="move(1)"><ChevronRight :size="18" /></button>
      </div>
    </div>
    <div class="calendar-grid">
      <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
      <button v-for="(date, index) in cells" :key="date ? keyFor(date) : 'blank-'+index" class="calendar-cell" :class="[stateFor(date), { blank: !date, selected: date && keyFor(date) === store.selectedDate, today: date && keyFor(date) === dateKey(new Date()) }]" :disabled="!date" :aria-label="date ? keyFor(date) : undefined" @click="select(date)">
        <span v-if="date">{{ date.getDate() }}</span>
        <i v-if="date && store.data.logs.some(l => l.date === keyFor(date))" class="log-dot"></i>
      </button>
    </div>
    <div class="calendar-legend">
      <span><i class="legend-dot period"></i> Period</span>
      <span><i class="legend-dot predicted"></i> Predicted</span>
      <span><i class="legend-dot ovulation"></i> Ovulation estimate</span>
    </div>
  </section>
</template>
