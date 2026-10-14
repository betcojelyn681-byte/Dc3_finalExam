<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { CalendarDays, Heart, Activity, Sparkles, ArrowRight, Plus, BookOpen, Clock3, CircleCheck, Smile, Flower2 } from 'lucide-vue-next'
import { useCycleStore } from '../stores/cycle'
import StatCard from '../components/StatCard.vue'
import CalendarGrid from '../components/CalendarGrid.vue'
import { prettyDate, dateKey, daysBetween } from '../utils/cycle'
import illustration from '../assets/bloom-illustration.svg'
const store = useCycleStore()
const router = useRouter()
const month = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12)
const daysUntil = computed(() => store.nextPeriod ? daysBetween(dateKey(new Date()), store.nextPeriod) : null)
const recentLogs = computed(() => store.data.logs.slice(0, 3))
const dateText = computed(() => store.nextPeriod ? prettyDate(store.nextPeriod, { month: 'long', day: 'numeric' }) : 'Add your first period')
</script>
<template>
  <div class="page-stack">
    <section class="welcome-row">
      <div><p class="eyebrow">{{ new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) }}</p><h1>Good day, {{ store.data.profile.name || 'friend' }} <Flower2 class="wave" :size="22" stroke-width="1.8" aria-hidden="true" /></h1><p class="page-subtitle">A little space to understand your cycle and care for yourself.</p></div>
      <button class="btn btn-primary" @click="router.push('/log')"><Plus :size="17" /> Daily check-in</button>
    </section>
    <section class="hero-card">
      <div class="hero-copy"><div class="hero-badge"><Sparkles :size="14" /> YOUR CYCLE AT A GLANCE</div><h2>{{ store.cycleDay ? `You're on day ${store.cycleDay} of your cycle` : 'Get to know your cycle' }}</h2><p>{{ store.phase.description }}</p><div class="hero-date"><span class="hero-date-icon"><CalendarDays :size="18" /></span><div><small>Next period estimate</small><strong>{{ dateText }}</strong></div><span v-if="store.nextPeriod" class="days-pill">{{ daysUntil === 0 ? 'Today' : daysUntil < 0 ? 'Past estimate' : `In ${daysUntil} days` }}</span></div><div class="hero-actions"><button class="btn btn-primary" @click="router.push('/calendar')">Open calendar <ArrowRight :size="16" /></button><button class="btn btn-soft" @click="router.push('/insights')">View insights</button></div></div>
      <div class="hero-art"><img :src="illustration" alt="Soft floral cycle illustration" /><div class="art-note"><Heart :size="15" fill="currentColor" /> Every cycle is personal</div></div>
    </section>
    <section class="stats-grid">
      <StatCard label="Average cycle" :value="`${store.averageCycle} days`" detail="Based on your settings and history" :icon="CalendarDays" tone="rose" />
      <StatCard label="Period length" :value="`${store.data.profile.periodLength} days`" detail="Your usual bleeding duration" :icon="Activity" tone="peach" />
      <StatCard label="Current phase" :value="store.phase.name" detail="An estimate, not a diagnosis" :icon="Sparkles" tone="lavender" />
    </section>
    <section class="dashboard-columns">
      <div class="panel calendar-panel"><div class="panel-title-row"><div><h2>Your calendar</h2><p>Keep track of your dates</p></div><RouterLink to="/calendar" class="inline-link">Full calendar <ArrowRight :size="14" /></RouterLink></div><CalendarGrid v-model="month" compact @select="router.push('/log')" /></div>
      <div class="right-stack">
        <div class="panel today-panel"><div class="panel-title-row"><div><h2>Today's check-in</h2><p>{{ prettyDate(dateKey(new Date()), { weekday: 'long', month: 'short', day: 'numeric' }) }}</p></div><span class="soft-icon"><Heart :size="19" /></span></div><template v-if="store.data.logs.some(l => l.date === dateKey(new Date()))"><div class="checkin-complete"><span class="complete-icon"><CircleCheck :size="18" stroke-width="2.4" /></span><div><strong>You've checked in today</strong><p>Thanks for taking a moment for yourself.</p></div></div><button class="btn btn-secondary full-width" @click="store.selectedDate = dateKey(new Date()); router.push('/log')">Edit today's log</button></template><template v-else><div class="checkin-empty"><div class="mood-face"><Smile :size="25" stroke-width="1.8" /></div><strong>How are you feeling?</strong><p>Log your mood, symptoms, and energy in a few taps.</p></div><button class="btn btn-primary full-width" @click="router.push('/log')"><Plus :size="16" /> Add check-in</button></template></div>
        <div class="panel recent-panel"><div class="panel-title-row"><div><h2>Recent check-ins</h2><p>Your latest entries</p></div><Clock3 :size="18" class="muted-icon" /></div><div v-if="recentLogs.length" class="recent-list"><button v-for="log in recentLogs" :key="log.id" class="recent-item" @click="store.selectedDate = log.date; router.push('/log')"><span class="recent-date">{{ prettyDate(log.date) }}</span><span class="recent-mood">{{ log.mood }}</span><span class="recent-symptoms">{{ log.symptoms.length ? log.symptoms.slice(0, 2).join(', ') : 'No symptoms logged' }}</span><ArrowRight :size="15" /></button></div><div v-else class="empty-mini"><Flower2 :size="24" stroke-width="1.8" /><p>Your check-ins will appear here.</p><RouterLink to="/log" class="inline-link">Create first entry <ArrowRight :size="14" /></RouterLink></div></div>
      </div>
    </section>
    <section class="learn-banner"><div class="learn-banner-icon"><BookOpen :size="22" /></div><div><strong>A little learning goes a long way</strong><p>Explore gentle, evidence-aware guides to cycle basics and self-care.</p></div><RouterLink to="/learn" class="btn btn-secondary">Explore library <ArrowRight :size="15" /></RouterLink></section>
    <p class="medical-note">Bloom provides estimates for educational tracking only. Predictions can be wrong and should not be used as contraception or as a medical diagnosis.</p>
  </div>
</template>
