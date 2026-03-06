<script setup lang="ts">
import { useId } from 'vue'

withDefaults(defineProps<{
  chevron?: 'right' | 'down'
}>(), {
  chevron: 'down',
})

const isOpen = defineModel<boolean>({ default: false })
const panelId = useId()
</script>

<template>
  <div class="tb-expandable">
    <button
      type="button"
      class="tb-expandable__header"
      :aria-expanded="isOpen"
      :aria-controls="panelId"
      @click="isOpen = !isOpen"
    >
      <slot name="header" />
      <svg
        class="tb-icon-md tb-flex-shrink-0 tb-text-muted tb-chevron"
        :class="[
          chevron === 'down' ? 'tb-chevron--down' : '',
          isOpen ? 'tb-chevron--open' : '',
        ]"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          v-if="chevron === 'down'"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
        <path
          v-else
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
    <div v-if="isOpen" :id="panelId" role="region" class="tb-expandable__body">
      <slot />
    </div>
  </div>
</template>
