<script setup lang="ts" generic="T extends string">
defineProps<{
  label: string
  options: { value: T; label: string; description: string }[]
  disabled?: boolean
}>()

const selected = defineModel<T>({ required: true })
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-xs font-semibold uppercase tracking-wider text-text-muted">{{ label }}</span>
    <div class="flex rounded-lg border border-border overflow-hidden">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        :disabled="disabled"
        class="px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
        :class="selected === option.value
          ? 'bg-accent text-white'
          : 'bg-surface-overlay text-text-secondary hover:text-text-primary'"
        :title="option.description"
        @click="selected = option.value"
      >
        {{ option.label }}
      </button>
    </div>
    <span class="text-[10px] text-text-muted hidden sm:inline">{{ options.find(option => option.value === selected)?.description }}</span>
  </div>
</template>
