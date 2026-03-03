<script setup lang="ts">
import { ref } from 'vue'

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
    class="relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer"
    :class="dragging ? 'border-accent bg-accent/10' : 'border-border hover:border-border-focus'"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
    @click="fileInput?.click()"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onFileInput"
    >
    <div class="text-text-muted">
      <p class="text-sm font-medium">Drop an image here or click to browse</p>
      <p class="text-xs mt-1">Supports PNG, JPG, GIF, WebP, and BMP</p>
    </div>
  </div>
</template>
