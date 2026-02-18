<script setup lang="ts">
import { computed } from 'vue';
import type { UrlEncodeMode, UrlModeOption } from './types'

const props = defineProps<{ modelValue: UrlEncodeMode }>()
const emit = defineEmits<{ 'update:modelValue': [mode: UrlEncodeMode] }>()

const OPTIONS: UrlModeOption[] = [
  { value: 'component', label: 'Component', description: 'encodeURIComponent — for query param values' },
  { value: 'full', label: 'Full URI', description: "encodeURI — preserves :/?#[]@!$&'()*+,;=" },
]

const description = computed(() => OPTIONS.find(option => option.value === props.modelValue)?.description ?? '')
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-xs font-semibold uppercase tracking-wider text-text-muted">Mode</span>
    <div class="flex rounded-lg border border-border overflow-hidden">
      <button
        v-for="option in OPTIONS"
        :key="option.value"
        type="button"
        class="px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
        :class="modelValue === option.value
          ? 'bg-accent text-white'
          : 'bg-surface-overlay text-text-secondary hover:text-text-primary'"
        :title="option.description"
        @click="emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
    <span class="text-[10px] text-text-muted hidden sm:inline">{{ description }}</span>
  </div>
</template>
