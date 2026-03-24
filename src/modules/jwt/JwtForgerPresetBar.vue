<script setup lang="ts">
import { ref } from 'vue'
import { TOKEN_PRESETS } from './forger-logic'
import type { TokenPreset } from './forger-types'

const emit = defineEmits<{
  select: [preset: TokenPreset]
}>()

const selectedIndex = ref<number | null>(null)

function selectPreset(index: number) {
  selectedIndex.value = index
  emit('select', TOKEN_PRESETS[index])
}
</script>

<template>
  <div class="tb-stack-2">
    <div class="tb-row tb-row--gap-2 tb-row--wrap">
      <span class="tb-text-sm tb-text-secondary tb-flex-shrink-0">Load preset:</span>
      <button
        v-for="(preset, index) in TOKEN_PRESETS"
        :key="preset.label"
        type="button"
        class="tb-btn-pill tb-btn-pill--sm"
        :class="{ 'tb-btn-pill--active': selectedIndex === index }"
        @click="selectPreset(index)"
      >
        {{ preset.label }}
      </button>
    </div>
    <p v-if="selectedIndex !== null" class="tb-hint">
      {{ TOKEN_PRESETS[selectedIndex].description }}
    </p>
  </div>
</template>
