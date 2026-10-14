<script setup>
import { computed } from 'vue'
import { useCycleStore } from '../stores/cycle'
import { daysBetween, prettyDate } from '../utils/cycle'
import { ChartNoAxesCombined, CalendarDays, Heart, Activity, Sparkles } from 'lucide-vue-next'
const store = useCycleStore()
const starts = computed(() => [...store.periodStarts].sort().slice(-6))
const intervals = computed(() => starts.value.slice(1).map((s, i) => ({ from: starts.value[i], to: s, days: daysBetween(starts.value[i], s) })))
const bars = computed(() => {
  const counts = {}
  store.data.logs.forEach(log => log.symptoms.forEach(s => counts[s] = (counts[s] || 0) + 1))
  return Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,5).map(([name, count]) => ({ name, count, width: Math.max(8, Math.round(count / Math.max(1, ...Object.values(counts)) * 100)) }))
})
const loggedDays = computed(() => new Set(store.data.logs.map(l => l.date)).size)
const totalSymptoms = computed(() => store.data.logs.reduce((n, l) => n + l.symptoms.length, 0))
</script>
<template>
  <div class="page-stack">
    <section class="page-heading-row"><div><p class="eyebrow">PATTERNS, NOT PRESSURE</p><h1>Cycle insights</h1><p class="page-subtitle">A simple look at the patterns in your own records.</p></div><span class="heading-art-icon"><ChartNoAxesCombined :size="23" /></span></section>
    <div class="stats-grid insights-stats"><article class="stat-card"><div class="stat-top"><span>Average cycle length</span><span class="stat-icon rose"><CalendarDays :size="18" /></span></div><div class="stat-value">{{ store.averageCycle }} days</div><p>{{ store.periodStarts.length > 1 ? 'Estimated from recorded starts' : 'Using your current setting' }}</p></article><article class="stat-card"><div class="stat-top"><span>Check-in days</span><span class="stat-icon lavender"><Heart :size="18" /></span></div><div class="stat-value">{{ loggedDays }}</div><p>Days you recorded how you felt</p></article><article class="stat-card"><div class="stat-top"><span>Symptoms logged</span><span class="stat-icon peach"><Activity :size="18" /></span></div><div class="stat-value">{{ totalSymptoms }}</div><p>Total symptom selections</p></article></div>
    <div class="insights-grid">
      <section class="panel"><div class="panel-title-row"><div><h2>Cycle history</h2><p>Days between recorded period starts</p></div><span class="soft-icon"><CalendarDays :size="18" /></span></div><div v-if="intervals.length" class="cycle-bars"><div v-for="item in intervals" :key="item.to" class="cycle-bar-row"><div class="cycle-bar-label"><span>{{ prettyDate(item.from) }} → {{ prettyDate(item.to) }}</span><strong>{{ item.days }} days</strong></div><div class="bar-track"><div class="bar-fill" :style="{ width: Math.min(100, item.days / 45 * 100) + '%' }"></div></div><small v-if="item.days < 21 || item.days > 35" class="variation-note">Outside the common 21–35 day range; one interval alone doesn't indicate a problem.</small></div></div><div v-else class="empty-state compact-empty"><div class="empty-illustration">✿</div><strong>More history, clearer patterns</strong><p>Record at least two period start dates to compare cycle intervals.</p><RouterLink to="/calendar" class="btn btn-secondary">Add period dates</RouterLink></div></section>
      <section class="panel"><div class="panel-title-row"><div><h2>Most logged symptoms</h2><p>Based on your saved check-ins</p></div><span class="soft-icon"><Sparkles :size="18" /></span></div><div v-if="bars.length" class="symptom-bars"><div v-for="bar in bars" :key="bar.name" class="symptom-bar-row"><div class="symptom-bar-label"><span>{{ bar.name }}</span><strong>{{ bar.count }}</strong></div><div class="bar-track"><div class="bar-fill bar-fill-lavender" :style="{ width: bar.width + '%' }"></div></div></div></div><div v-else class="empty-state compact-empty"><div class="empty-illustration">♡</div><strong>Your patterns will show up here</strong><p>Log a few symptoms in Daily check-in to see your personal summary.</p><RouterLink to="/log" class="btn btn-secondary">Start a check-in</RouterLink></div></section>
    </div>
    <div class="info-callout"><span>✦</span><p><strong>Be kind to yourself</strong> These charts summarize the data you entered; they are not medical analysis. If you are worried about your cycle, pain, or bleeding, a healthcare professional can help.</p></div>
  </div>
</template>
