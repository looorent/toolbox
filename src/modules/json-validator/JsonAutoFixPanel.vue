<script setup lang="ts">
defineProps<{
  fixSummary: string[]
}>()

const emit = defineEmits<{
  applyFix: []
}>()
</script>

<template>
  <div class="bg-accent/5 border border-accent/20 rounded-lg p-4 space-y-3">
    <div class="flex items-start gap-3">
      <div class="mt-0.5 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
        <svg class="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <title>Valid</title>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <div>
        <p class="text-sm font-semibold text-accent">Auto-fix available</p>
        <ul class="mt-1 space-y-0.5">
          <li v-for="(summary, index) in fixSummary" :key="index" class="text-xs text-text-secondary">
            &bull; {{ summary }}
          </li>
        </ul>
      </div>
    </div>

    <button
      type="button"
      class="ml-8 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors"
      @click="emit('applyFix')"
    >
      Apply fix
    </button>
  </div>
</template>
