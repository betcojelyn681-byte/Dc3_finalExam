<script setup>
import { reactive, ref, watch } from 'vue'
import { useCycleStore } from '../stores/cycle'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { UserRound, CalendarDays, BellRing, ShieldCheck, RotateCcw, Save, Download } from 'lucide-vue-next'
const store = useCycleStore()
const form = reactive({ ...store.data.profile })
const confirmOpen = ref(false)
watch(() => store.data.profile, p => Object.assign(form, p), { deep: true })
function save() { store.saveProfile({ ...form }) }
function exportData() {
  const blob = new Blob([store.exportData()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'bloom-cycle-data.json'; a.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  store.showNotice('Your data export has been prepared.')
}
function reset() { store.resetAll(); Object.assign(form, store.data.profile); confirmOpen.value = false }
</script>
<template>
  <div class="page-stack settings-page">
    <section class="page-heading-row"><div><p class="eyebrow">MAKE BLOOM YOURS</p><h1>Settings</h1><p class="page-subtitle">Manage your preferences and how this demo stores information.</p></div><span class="heading-art-icon"><UserRound :size="23" /></span></section>
    <form class="settings-form" @submit.prevent="save">
      <section class="panel settings-panel"><div class="settings-section-title"><span class="settings-icon"><UserRound :size="19" /></span><div><h2>Your profile</h2><p>A friendly name for your personal space</p></div></div><div class="form-section"><label class="field-label" for="profile-name">Display name</label><input id="profile-name" v-model="form.name" maxlength="40" placeholder="What should we call you?" /></div></section>
      <section class="panel settings-panel"><div class="settings-section-title"><span class="settings-icon"><CalendarDays :size="19" /></span><div><h2>Cycle settings</h2><p>Used for calendar estimates. You can change these anytime.</p></div></div><div class="form-grid-two"><div class="form-section"><label class="field-label" for="cycle-length">Typical cycle length</label><div class="input-with-suffix"><input id="cycle-length" v-model.number="form.cycleLength" type="number" min="15" max="45" required /><span>days</span></div><small class="field-help">Allowed range: 15–45 days.</small></div><div class="form-section"><label class="field-label" for="period-length">Typical period length</label><div class="input-with-suffix"><input id="period-length" v-model.number="form.periodLength" type="number" min="1" max="10" required /><span>days</span></div><small class="field-help">Allowed range: 1–10 days.</small></div></div><div class="settings-tip"><span>✦</span> Estimates use your most recent period start and these settings. They are not guarantees.</div></section>
      <section class="panel settings-panel"><div class="settings-section-title"><span class="settings-icon"><BellRing :size="19" /></span><div><h2>Reminders</h2><p>Choose whether to show gentle in-app reminders.</p></div></div><label class="toggle-row"><span><strong>Cycle reminders</strong><small>Show an estimate reminder in the top bar.</small></span><input v-model="form.reminders" type="checkbox" class="toggle-input" /><span class="toggle-ui"></span></label><div class="form-section reminder-days"><label class="field-label" for="reminder-days">Remind me (display preference)</label><select id="reminder-days" v-model.number="form.reminderDays"><option :value="1">1 day before</option><option :value="2">2 days before</option><option :value="3">3 days before</option><option :value="5">5 days before</option></select><small class="field-help">Saved as a preference only; this student demo does not send browser or push notifications.</small></div></section>
      <div class="settings-save-row"><button class="btn btn-primary" type="submit"><Save :size="16" /> Save preferences</button></div>
    </form>
    <section class="panel settings-panel"><div class="settings-section-title"><span class="settings-icon"><ShieldCheck :size="19" /></span><div><h2>Privacy and your data</h2><p>Understand where your information is stored.</p></div></div><div class="privacy-detail"><div class="privacy-check">✓</div><div><strong>Stored locally in this browser</strong><p>Your data is saved to localStorage on this device. There is no cloud account or sync in this student prototype.</p></div></div><div class="privacy-actions"><button class="btn btn-secondary" type="button" @click="exportData"><Download :size="16" /> Export my data</button><button class="btn btn-danger-soft" type="button" @click="confirmOpen = true"><RotateCcw :size="16" /> Reset all demo data</button></div></section>
    <div class="info-callout"><span>♡</span><p><strong>A note about sensitive information</strong> Browser localStorage is not encrypted. Use this demo on a personal device only, and do not treat it as a secure medical record system.</p></div>
    <ConfirmDialog
      v-model="confirmOpen"
      title="Reset all Bloom data?"
      message="Period records, daily check-ins, and preferences will be permanently removed from this browser. This cannot be undone."
      confirm-label="Reset data"
      cancel-label="Cancel"
      @confirm="reset"
    />
  </div>
</template>
