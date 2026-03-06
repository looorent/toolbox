<script setup lang="ts">
import { TbInput } from '@components'
import { useRecentTools } from '@composables/useRecentTools'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import GithubIcon from './GithubIcon.vue'
import { findActiveTool, isToolActive, searchTools, sections } from './logic'
import SidebarToolLink from './SidebarToolLink.vue'
import type { Tool } from './types'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const searchQuery = ref('')
const { recentTools, addRecentTool } = useRecentTools()
const searchResults = computed(() => searchTools(searchQuery.value))

watch(
  () => route.path,
  path => {
    const tool = findActiveTool(path)
    if (tool !== null) {
      addRecentTool(tool.path)
    }
  },
  { immediate: true }
)

function isActive(tool: Tool): boolean {
  return isToolActive(tool, route.path)
}
</script>

<template>
  <div class="tb-sidebar" :class="{ 'tb-sidebar--open': props.open }">
    <div
      v-if="props.open"
      class="tb-sidebar__backdrop"
      @click="emit('close')"
    />
    <nav class="tb-sidebar__panel">
      <div class="tb-sidebar__header">
        <h1 class="tb-sidebar__title">
          <span class="tb-text-accent tb-font-bold">&#9670;</span> Dev Toolbox
        </h1>
        <button
          class="tb-sidebar__close"
          type="button"
          aria-label="Close sidebar"
          @click="emit('close')"
        >
          <svg class="tb-icon-lg" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="tb-sidebar__search">
        <TbInput
          v-model="searchQuery"
          type="search"
          placeholder="Search tools…"
          class="tb-sidebar__search-input"
        />
      </div>
      <div class="tb-sidebar__nav tb-stack-4">
        <div v-if="!searchQuery && recentTools.length > 0">
          <p class="tb-sidebar__section-label">Recent</p>
          <div class="tb-stack-1">
            <SidebarToolLink
              v-for="tool in recentTools"
              :key="tool.path"
              :tool="tool"
              :active="isActive(tool)"
            />
          </div>
        </div>
        <div v-if="searchQuery && searchResults.length > 0">
          <div class="tb-stack-1">
            <SidebarToolLink
              v-for="tool in searchResults"
              :key="tool.path"
              :tool="tool"
              :active="isActive(tool)"
            />
          </div>
        </div>
        <p
          v-if="searchQuery && searchResults.length === 0"
          class="tb-sidebar__no-match"
        >No results</p>
        <template v-if="!searchQuery">
          <div v-for="section in sections" :key="section.label">
            <p class="tb-sidebar__section-label">{{ section.label }}</p>
            <div class="tb-stack-1">
              <SidebarToolLink
                v-for="tool in section.tools"
                :key="tool.path"
                :tool="tool"
                :active="isActive(tool)"
              />
            </div>
          </div>
        </template>
      </div>
      <div class="tb-sidebar__footer">
        <a
          href="https://github.com/looorent/toolbox"
          target="_blank"
          rel="noopener noreferrer"
          class="tb-sidebar__footer-link"
        >
          <GithubIcon class="tb-icon-md" />
          <span>source</span>
        </a>
      </div>
    </nav>
  </div>
</template>
