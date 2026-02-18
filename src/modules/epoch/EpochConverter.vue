<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import EpochResultGrid from './EpochResultGrid.vue'
import { allTimeZones, buildTimezoneField, dateToTimestamp, localTimeZone, millisecondsToDate, parseHumanDate, RESULT_FIELDS } from './logic'
import TimezoneDropdown from './TimezoneDropdown.vue'
import type { EpochResult } from './types'

const secondsInput = ref('')
const millisecondsInput = ref('')
const dateInput = ref('')
const result = ref<EpochResult | null>(null)
const error = ref(false)
const updating = ref(false)
const liveTimer = ref<ReturnType<typeof setInterval> | null>(null)

const selectedTimezone = ref(localTimeZone())
const timezones = allTimeZones()

const tzField = computed(() => buildTimezoneField(selectedTimezone.value))

watch(selectedTimezone, () => {
  if (result.value) {
    const parsedMilliseconds = Number(millisecondsInput.value)
    if (millisecondsInput.value.trim() && Number.isFinite(parsedMilliseconds)) {
      const recomputedResult = millisecondsToDate(parsedMilliseconds, selectedTimezone.value)
      if (recomputedResult) {
        result.value = recomputedResult
      }
    }
  }
})

watch(secondsInput, newSecondsInput => {
  if (!updating.value) {
    updating.value = true
    if (!newSecondsInput.trim()) {
      result.value = null
      error.value = false
      millisecondsInput.value = ''
      dateInput.value = ''
    } else {
      const parsedSeconds = Number(newSecondsInput)
      const secondsResult = Number.isFinite(parsedSeconds)
        ? millisecondsToDate(Math.floor(parsedSeconds) * 1000, selectedTimezone.value)
        : null
      if (secondsResult) {
        result.value = secondsResult
        error.value = false
        millisecondsInput.value = String(secondsResult.milliseconds)
        dateInput.value = secondsResult.iso
      } else {
        result.value = null
        error.value = true
      }
    }
  
    requestAnimationFrame(() => { updating.value = false })
  }
})

watch(millisecondsInput, newMillisecondsInput => {
  if (updating.value) {
    updating.value = true
    if (!newMillisecondsInput.trim()) {
      result.value = null
      error.value = false
      secondsInput.value = ''
      dateInput.value = ''
    } else {
      const parsedMilliseconds = Number(newMillisecondsInput)
      const millisecondsResult = Number.isFinite(parsedMilliseconds)
        ? millisecondsToDate(parsedMilliseconds, selectedTimezone.value)
        : null
      if (millisecondsResult) {
        result.value = millisecondsResult
        error.value = false
        secondsInput.value = String(millisecondsResult.seconds)
        dateInput.value = millisecondsResult.iso
      } else {
        result.value = null
        error.value = true
      }
    }
  
    requestAnimationFrame(() => { updating.value = false })
  }
})

watch(dateInput, newDateInput => {
  if (updating.value) {
    updating.value = true
  
    if (!newDateInput.trim()) {
      result.value = null
      error.value = false
      secondsInput.value = ''
      millisecondsInput.value = ''
    } else {
      const parsedResult = parseHumanDate(newDateInput, selectedTimezone.value)
      if (parsedResult) {
        result.value = parsedResult
        error.value = false
        secondsInput.value = String(parsedResult.seconds)
        millisecondsInput.value = String(parsedResult.milliseconds)
      } else {
        result.value = null
        error.value = true
      }
    }
  
    requestAnimationFrame(() => { updating.value = false })
  }
})

function stopLive() {
  if (liveTimer.value) {
    clearInterval(liveTimer.value)
    liveTimer.value = null
  }
}

function updateNow() {
  const currentResult = dateToTimestamp(new Date(), selectedTimezone.value)
  result.value = currentResult
  error.value = false

  updating.value = true
  secondsInput.value = String(currentResult.seconds)
  millisecondsInput.value = String(currentResult.milliseconds)
  dateInput.value = currentResult.iso
  requestAnimationFrame(() => { updating.value = false })
}

function fillNow() {
  if (liveTimer.value) {
    stopLive()
  } else {
    updateNow()
    liveTimer.value = setInterval(updateNow, 1000)
  }
}

watch([secondsInput, millisecondsInput, dateInput], () => {
  if (!updating.value) {
    stopLive()
  }
})

onUnmounted(stopLive)
</script>

<template>
  <div class="space-y-6">
    <p class="text-sm text-text-secondary">Convert between Unix timestamps and human-readable dates.</p>

    <div class="flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
        :class="liveTimer
          ? 'bg-accent text-white'
          : 'bg-surface-overlay text-text-secondary hover:text-text-primary border border-border'"
        @click="fillNow"
      >
        {{ liveTimer ? 'Live ·' : 'Now' }}
      </button>

      <TimezoneDropdown v-model="selectedTimezone" :timezones="timezones" />
    </div>

    <div class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Seconds</label>
          <input
            v-model="secondsInput"
            placeholder="1700000000"
            class="w-full bg-surface-overlay border rounded-lg px-4 py-3 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none transition-colors"
            :class="error && secondsInput.trim() ? 'border-error' : 'border-border focus:border-border-focus'"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Milliseconds</label>
          <input
            v-model="millisecondsInput"
            placeholder="1700000000000"
            class="w-full bg-surface-overlay border rounded-lg px-4 py-3 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none transition-colors"
            :class="error && millisecondsInput.trim() ? 'border-error' : 'border-border focus:border-border-focus'"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Human-readable Date</label>
        <input
          v-model="dateInput"
          placeholder="2025-01-15T10:30:00Z or Jan 15, 2025"
          class="w-full bg-surface-overlay border rounded-lg px-4 py-3 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none transition-colors"
          :class="error && dateInput.trim() ? 'border-error' : 'border-border focus:border-border-focus'"
        />
      </div>

      <p v-if="error" class="text-xs text-error">Invalid input — enter a numeric timestamp or a recognizable date string.</p>
    </div>

    <EpochResultGrid
      v-if="result"
      :result="result"
      :fields="RESULT_FIELDS"
      :tz-field="tzField"
    />
  </div>
</template>
