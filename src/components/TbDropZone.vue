<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  accept?: string
  label?: string
  subtitle?: string
}>(), {
  accept: '*',
  label: 'Drop a file here or click to browse',
  subtitle: '',
})

const emit = defineEmits<{
  file: [file: File]
}>()

const dragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function onFileInput(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (file) {
    emit('file', file)
  }

  input.value = ''
}

function onDrop(event: DragEvent) {
  dragging.value = false
  const file = event.dataTransfer?.files[0]

  if (file) {
    emit('file', file)
  }
}

function onDragOver() {
  dragging.value = true
}

function onDragLeave() {
  dragging.value = false
}
</script>

<template>
  <div
    class="tb-drop-zone"
    :class="{ 'tb-drop-zone--active': dragging }"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
    @click="fileInput?.click()"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="props.accept"
      class="tb-drop-zone__input"
      @change="onFileInput"
    >
    <div class="tb-text-muted">
      <p class="tb-text-sm tb-font-medium">{{ props.label }}</p>
      <p v-if="props.subtitle" class="tb-text-xs tb-drop-zone__subtitle">{{ props.subtitle }}</p>
    </div>
  </div>
</template>
