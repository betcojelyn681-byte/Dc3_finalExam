<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Are you sure?' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirm' },
  cancelLabel: { type: String, default: 'Cancel' }
})
const emit = defineEmits(['update:modelValue', 'confirm'])
function close() { emit('update:modelValue', false) }
function doConfirm() { emit('confirm'); close() }
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-title" @click.self="close">
      <section class="modal-card confirm-dialog">
        <div class="modal-heading">
          <h2 id="confirm-title">{{ title }}</h2>
          <button class="icon-button" aria-label="Close dialog" @click="close">×</button>
        </div>
        <p v-if="message" class="confirm-message">{{ message }}</p>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="close">{{ cancelLabel }}</button>
          <button type="button" class="btn btn-primary" @click="doConfirm">{{ confirmLabel }}</button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
