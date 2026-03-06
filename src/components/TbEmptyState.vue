<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  error?: string | null
  full?: boolean
}>(), {
  description: '',
  error: null,
  full: false,
})
</script>

<template>
  <div class="tb-empty-state" :class="{ 'tb-empty-state--full': full }">
    <div v-if="$slots.icon" class="tb-empty-state__icon">
      <slot name="icon" />
    </div>

    <template v-if="full">
      <div class="tb-stack-3 tb-empty-state__text">
        <h2 class="tb-text-xl tb-font-semibold tb-text-primary">{{ title }}</h2>
        <p v-if="description" class="tb-text-description">{{ description }}</p>
      </div>
    </template>

    <template v-else>
      <p class="tb-text-sm tb-text-muted">{{ title }}</p>
      <p v-if="description" class="tb-empty-state__description tb-text-muted">{{ description }}</p>
    </template>

    <slot />
    <p v-if="error" role="alert" class="tb-text-sm tb-text-error">{{ error }}</p>
  </div>
</template>
