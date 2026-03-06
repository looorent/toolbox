<script setup lang="ts">
import { TbFieldInput } from '@components'
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
  <div class="tb-stack-6">
    <p class="tb-text-description">Convert between Unix timestamps and human-readable dates.</p>

    <div class="tb-row tb-row--gap-3 tb-row--wrap">
      <button
        type="button"
        class="tb-btn-pill tb-btn-pill--sm"
        :class="{ 'tb-btn-pill--active': liveTimer }"
        @click="fillNow"
      >
        {{ liveTimer ? 'Live ·' : 'Now' }}
      </button>

      <TimezoneDropdown v-model="selectedTimezone" :timezones="timezones" />
    </div>

    <div class="tb-stack-4">
      <div class="tb-grid-2">
        <TbFieldInput
          label="Seconds"
          v-model="secondsInput"
          placeholder="1700000000"
          :error="error && !!secondsInput.trim()"
        />

        <TbFieldInput
          label="Milliseconds"
          v-model="millisecondsInput"
          placeholder="1700000000000"
          :error="error && !!millisecondsInput.trim()"
        />
      </div>

      <TbFieldInput
        label="Human-readable Date"
        v-model="dateInput"
        placeholder="2025-01-15T10:30:00Z or Jan 15, 2025"
        :error="error && !!dateInput.trim()"
      />

      <p v-if="error" role="alert" class="tb-error-text">Invalid input — enter a numeric timestamp or a recognizable date string.</p>
    </div>

    <EpochResultGrid
      v-if="result"
      :result="result"
      :fields="RESULT_FIELDS"
      :tz-field="tzField"
    />
  </div>
</template>
