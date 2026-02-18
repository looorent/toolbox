<script setup lang="ts">
import { computed, ref } from 'vue'

const selectedTimezone = defineModel<string>({ required: true })

const props = defineProps<{
  timezones: string[]
}>()

const timezoneSearch = ref('')
const timezoneDropdownOpen = ref(false)

const filteredTimezone = computed(() => {
  const searchQuery = timezoneSearch.value.toLowerCase()
  return searchQuery
    ? props.timezones.filter(tz => tz.toLowerCase().includes(searchQuery))
    : props.timezones
})

function toggleDropdown() {
  timezoneDropdownOpen.value = !timezoneDropdownOpen.value
}

function closeDropdown() {
  timezoneDropdownOpen.value = false
}

function selectTimezone(tz: string) {
  selectedTimezone.value = tz
  timezoneDropdownOpen.value = false
  timezoneSearch.value = ''
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-overlay text-text-secondary hover:text-text-primary border border-border transition-colors flex items-center gap-1.5"
      @click="toggleDropdown"
    >
      <svg class="w-3 h-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-width="2" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg>
      {{ selectedTimezone }}
      <svg class="w-3 h-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
    </button>

    <div
      v-if="timezoneDropdownOpen"
      class="absolute z-50 mt-1 left-0 w-72 bg-surface-raised border border-border rounded-lg shadow-lg overflow-hidden"
    >
      <div class="p-2 border-b border-border">
        <input
          v-model="timezoneSearch"
          placeholder="Search timezones..."
          class="w-full bg-surface-overlay border border-border rounded px-3 py-1.5 text-xs font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus"
          @keydown.escape="closeDropdown"
        />
      </div>
      <div class="max-h-60 overflow-y-auto">
        <button
          v-for="timezone in filteredTimezone"
          :key="timezone"
          type="button"
          class="w-full text-left px-3 py-1.5 text-xs font-mono transition-colors"
          :class="timezone === selectedTimezone
            ? 'bg-accent/15 text-accent'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-overlay'"
          @click="selectTimezone(timezone)"
        >
          {{ timezone }}
        </button>
        <p v-if="filteredTimezone.length === 0" class="px-3 py-2 text-xs text-text-muted">No match</p>
      </div>
    </div>

    <div
      id="click-away-overlay"
      v-if="timezoneDropdownOpen"
      class="fixed inset-0 z-40"
      @click="closeDropdown"
    ></div>
  </div>
</template>
