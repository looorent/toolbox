<script setup lang="ts">
const props = defineProps<{
  progress: number
}>()
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between text-xs text-text-muted">
      <span>Converting...</span>
      <span>{{ Math.round(props.progress * 100) }}%</span>
    </div>
    <div class="w-full h-1.5 bg-surface-overlay rounded-full overflow-hidden">
      <div
        class="h-full bg-accent rounded-full transition-all duration-200"
        :style="{ width: `${props.progress * 100}%` }"
      />
    </div>
  </div>
</template>
