<script setup lang="ts">
withDefaults(defineProps<{
  clickable?: boolean
  title?: string
  titleClass?: string
  sectioned?: boolean
}>(), {
  clickable: false,
  title: '',
  titleClass: '',
  sectioned: false,
})
</script>

<template>
  <div class="tb-card" :class="{ 'tb-card--clickable': clickable, 'tb-card--sectioned': sectioned }">
    <template v-if="sectioned">
      <div class="tb-card__header tb-row tb-row--between">
        <p class="tb-label tb-label--inline" :class="titleClass">{{ title }}</p>
        <slot name="actions" />
      </div>
      <div class="tb-card__body">
        <slot />
      </div>
    </template>

    <template v-else>
      <p v-if="title" class="tb-label">{{ title }}</p>
      <slot />
    </template>
  </div>
</template>
