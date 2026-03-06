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
  <div class="tb-app-layout">
    <AppSidebar :open="sidebarOpen" @close="closeSidebar" />

    <main class="tb-app-main">
      <header class="tb-app-header">
        <button
          class="tb-app-header__hamburger"
          type="button"
          aria-label="Open menu"
          @click="openSidebar"
        >
          <svg class="tb-icon-lg" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <h2 class="tb-app-header__title">{{ currentTool?.name }}</h2>
      </header>
      <div class="tb-app-content">
        <router-view />
      </div>
    </main>
  </div>
</template>
