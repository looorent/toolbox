<script setup lang="ts">
import type { JsonDiagnostic } from './types'

defineProps<{
  diagnostic: JsonDiagnostic
  offendingLine: string | null
}>()
</script>

<template>
  <div class="bg-error/5 border border-error/20 rounded-lg p-4 space-y-2">
    <div class="flex items-start gap-3">
      <div class="mt-0.5 w-5 h-5 rounded-full bg-error/20 flex items-center justify-center shrink-0">
        <svg class="w-3 h-3 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </div>
      <div class="min-w-0">
        <p class="text-sm font-semibold text-error">{{ diagnostic.message }}</p>
        <p class="text-xs text-text-muted mt-0.5">Line {{ diagnostic.line }}, Column {{ diagnostic.column }}</p>
      </div>
    </div>
    <p class="text-sm text-text-secondary leading-relaxed pl-8">{{ diagnostic.hint }}</p>

    <div v-if="offendingLine != null" class="pl-8">
      <pre class="text-xs font-mono bg-surface-overlay border border-border rounded px-3 py-2 overflow-x-auto text-text-primary"><span class="text-text-muted select-none">{{ diagnostic.line }} | </span>{{ offendingLine }}</pre>
    </div>
  </div>
</template>
