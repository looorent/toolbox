<script setup lang="ts">
import { computed, ref, useId } from 'vue'

const props = defineProps<{
  options: string[]
  placeholder?: string
}>()

const model = defineModel<string>({ required: true })

const search = ref('')
const open = ref(false)
const activeIndex = ref(-1)
const listboxId = useId()

const filteredOptions = computed(() => {
  const query = search.value.toLowerCase()
  return query
    ? props.options.filter(option => option.toLowerCase().includes(query))
    : props.options
})

function toggle() {
  open.value = !open.value
  if (open.value) {
    activeIndex.value = filteredOptions.value.indexOf(model.value)
  }
}

function close() {
  open.value = false
  activeIndex.value = -1
}

function select(option: string) {
  model.value = option
  open.value = false
  search.value = ''
  activeIndex.value = -1
}

function optionId(index: number): string {
  return `${listboxId}-option-${index}`
}

function handleSearchKeydown(event: KeyboardEvent) {
  const length = filteredOptions.value.length
  switch (event.key) {
    case 'Escape':
      close()
      break
    case 'ArrowDown':
      event.preventDefault()
      activeIndex.value = (activeIndex.value + 1) % length
      break
    case 'ArrowUp':
      event.preventDefault()
      activeIndex.value = (activeIndex.value - 1 + length) % length
      break
    case 'Enter':
      if (activeIndex.value >= 0 && activeIndex.value < length) {
        event.preventDefault()
        select(filteredOptions.value[activeIndex.value] as string)
      }
      break
    case 'Home':
      event.preventDefault()
      activeIndex.value = 0
      break
    case 'End':
      event.preventDefault()
      activeIndex.value = length - 1
      break
  }
}
</script>

<template>
  <div class="tb-dropdown">
    <button
      type="button"
      class="tb-btn-pill tb-btn-pill--sm tb-row tb-row--gap-1"
      aria-haspopup="listbox"
      :aria-expanded="open"
      @click="toggle"
    >
      <slot name="icon" />
      {{ model }}
      <svg class="tb-icon-xs tb-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
    </button>

    <div
      v-if="open"
      class="tb-dropdown__menu tb-dropdown--fixed-width"
    >
      <div class="tb-dropdown__search">
        <div class="tb-search-field">
          <input
            v-model="search"
            :placeholder="placeholder"
            class="tb-dropdown__search-input"
            :aria-controls="listboxId"
            :aria-activedescendant="activeIndex >= 0 ? optionId(activeIndex) : undefined"
            @keydown="handleSearchKeydown"
          />
          <button
            v-if="search"
            type="button"
            class="tb-search-field__clear"
            aria-label="Clear search"
            @click="search = ''"
          >
            <svg class="tb-icon-sm" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
      <div :id="listboxId" role="listbox" class="tb-dropdown__list">
        <button
          v-for="(option, index) in filteredOptions"
          :id="optionId(index)"
          :key="option"
          type="button"
          role="option"
          class="tb-dropdown__item"
          :class="{
            'tb-dropdown__item--active': option === model || index === activeIndex,
          }"
          :aria-selected="option === model"
          @click="select(option)"
        >
          {{ option }}
        </button>
        <p v-if="filteredOptions.length === 0" class="tb-dropdown__no-match">No match</p>
      </div>
    </div>

    <div
      v-if="open"
      class="tb-dropdown__backdrop"
      @click="close"
    />
  </div>
</template>
