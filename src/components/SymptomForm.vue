<script setup>
import { computed, ref, watch } from 'vue'
import { useCycleStore } from '../stores/cycle'
import { Save, Trash2 } from 'lucide-vue-next'
const store = useCycleStore()
const symptomsList = ['Cramps', 'Headache', 'Bloating', 'Tender breasts', 'Acne', 'Fatigue', 'Backache', 'Cravings', 'Spotting', 'Nausea']
const moods = ['Great', 'Good', 'Okay', 'Low', 'Anxious', 'Irritable']
const date = ref(store.selectedDate)
const mood = ref('Okay')
const flow = ref('None')
const energy = ref('Medium')
const symptoms = ref([])
const notes = ref('')
const existing = computed(() => store.data.logs.find(l => l.date === date.value))
watch(() => store.selectedDate, (val) => { if (val !== date.value) date.value = val })
watch([date, existing], () => {
  const log = existing.value
  mood.value = log?.mood || 'Okay'
  flow.value = log?.flow || (store.isPeriodDate(date.value) ? 'Medium' : 'None')
  energy.value = log?.energy || 'Medium'
  symptoms.value = [...(log?.symptoms || [])]
  notes.value = log?.notes || ''
  store.selectedDate = date.value
}, { immediate: true })
function save() {
  if (!date.value) return
  store.saveLog({ date: date.value, mood: mood.value, flow: flow.value, energy: energy.value, symptoms: symptoms.value, notes: notes.value })
}
function clearForm() { mood.value = 'Okay'; flow.value = 'None'; energy.value = 'Medium'; symptoms.value = []; notes.value = '' }
</script>
<template>
  <form class="log-form" @submit.prevent="save">
    <div class="form-section">
      <label class="field-label" for="log-date">Check-in date</label>
      <input id="log-date" v-model="date" type="date" required />
    </div>
    <div class="form-section">
      <div class="field-label">How is your mood?</div>
      <div class="choice-row mood-choices">
        <button v-for="item in moods" :key="item" type="button" class="choice-chip" :class="{ chosen: mood === item }" @click="mood = item">{{ item }}</button>
      </div>
    </div>
    <div class="form-grid-two">
      <div class="form-section"><label class="field-label" for="flow">Flow</label><select id="flow" v-model="flow"><option>None</option><option>Spotting</option><option>Light</option><option>Medium</option><option>Heavy</option></select></div>
      <div class="form-section"><label class="field-label" for="energy">Energy</label><select id="energy" v-model="energy"><option>Low</option><option>Medium</option><option>High</option></select></div>
    </div>
    <div class="form-section">
      <div class="field-label">Any symptoms today?</div>
      <div class="symptom-options">
        <label v-for="symptom in symptomsList" :key="symptom" class="check-chip" :class="{ checked: symptoms.includes(symptom) }">
          <input v-model="symptoms" type="checkbox" :value="symptom" /><span>{{ symptom }}</span>
        </label>
      </div>
    </div>
    <div class="form-section"><label class="field-label" for="notes">Notes <span class="optional">· optional</span></label><textarea id="notes" v-model="notes" rows="3" maxlength="500" placeholder="Anything you want to remember about today…"></textarea><div class="character-count">{{ notes.length }}/500</div></div>
    <div class="form-actions"><button class="btn btn-secondary" type="button" @click="clearForm"><Trash2 :size="16" /> Clear form</button><button class="btn btn-primary" type="submit"><Save :size="16" /> Save check-in</button></div>
  </form>
</template>
