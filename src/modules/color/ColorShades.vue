<script setup lang="ts">
import { useCopy } from '@composables/useCopy'

defineProps<{
  shades: string[]
}>()

const emit = defineEmits<{
  selectColor: [color: string]
}>()

const { copy, copiedKey } = useCopy()

function handleShadeClick(shade: string, shadeIndex: number) {
  copy(`shade-${shadeIndex}`, shade.toUpperCase())
  emit('selectColor', shade)
}
</script>

<template>
  <div class="bg-surface-overlay border border-border rounded-lg p-4 space-y-3">
    <h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted">Shades</h3>
    <div class="flex gap-1">
      <button
        v-for="(shade, shadeIndex) in shades"
        :key="shadeIndex"
        type="button"
        class="h-10 flex-1 first:rounded-l-md last:rounded-r-md cursor-pointer hover:scale-y-125 active:scale-95 transition-transform relative"
        :style="{ backgroundColor: shade }"
        :title="shade.toUpperCase()"
        @click="handleShadeClick(shade, shadeIndex)"
      >
        <span
          v-if="copiedKey === `shade-${shadeIndex}`"
          class="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]"
        >Copied!</span>
      </button>
    </div>
  </div>
</template>
