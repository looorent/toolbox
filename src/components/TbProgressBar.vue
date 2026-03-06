<script setup lang="ts">
const props = withDefaults(defineProps<{
  progress: number
  label?: string
}>(), {
  label: '',
})
</script>

<template>
  <div class="tb-stack-2">
    <div class="tb-row tb-row--between tb-hint">
      <span>{{ props.label || 'Processing...' }}</span>
      <span>{{ Math.round(props.progress * 100) }}%</span>
    </div>
    <div
      class="tb-progress-bar"
      role="progressbar"
      :aria-valuenow="Math.round(props.progress * 100)"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-label="props.label || 'Processing...'"
    >
      <div
        class="tb-progress-bar__fill"
        :style="{ width: `${props.progress * 100}%` }"
      />
    </div>
  </div>
</template>
