<script setup lang="ts">
import { AppSidebar, findActiveTool } from '@modules/sidebar'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const sidebarOpen = ref(false)

const currentTool = computed(() => findActiveTool(route.path))

function closeSidebar() {
  sidebarOpen.value = false
}

function openSidebar() {
  sidebarOpen.value = true
}

watch(() => route.path, () => sidebarOpen.value = false)
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <AppSidebar :open="sidebarOpen" @close="closeSidebar" />

    <main class="flex-1 overflow-y-auto min-w-0">
      <header class="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b border-border px-4 sm:px-8 py-4 flex items-center gap-3">
        <button
          class="md:hidden p-1.5 -ml-1 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-overlay"
          type="button"
          @click="openSidebar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <title>Hamburger menu</title>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <h2 class="text-xl font-semibold text-text-primary">{{ currentTool?.name }}</h2>
      </header>
      <div class="p-4 sm:p-8 max-w-4xl">
        <router-view />
      </div>
    </main>
  </div>
</template>
