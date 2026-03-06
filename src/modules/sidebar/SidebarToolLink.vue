<script setup lang="ts">
import type { Tool } from './types'

defineProps<{
  tool: Tool
  active: boolean
}>()
</script>

<template>
  <router-link
    :to="tool.path"
    class="tb-sidebar__tool-link"
    :class="{ 'tb-sidebar__tool-link--active': active }"
  >
    <span class="tb-sidebar__tool-abbr">{{ tool.abbreviation }}</span>
    {{ tool.name }}
  </router-link>
</template>
