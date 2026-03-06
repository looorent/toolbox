<script setup lang="ts">
export type TbOptionGroupVariant = 'pill' | 'segmented' | 'tab'

export interface TbOptionGroupOption {
  value: string
  label: string
  description?: string
  badge?: string | number
  title?: string
}

const props = withDefaults(defineProps<{
  variant?: TbOptionGroupVariant
  options: TbOptionGroupOption[]
  label?: string
  size?: 'default' | 'sm'
  disabled?: boolean
}>(), {
  variant: 'pill',
  label: '',
  size: 'default',
  disabled: false,
})

const model = defineModel<string>({ required: true })

function handleTabKeydown(event: KeyboardEvent) {
  const currentIndex = props.options.findIndex(option => option.value === model.value)
  let nextIndex = -1

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault()
    nextIndex = (currentIndex + 1) % props.options.length
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault()
    nextIndex = (currentIndex - 1 + props.options.length) % props.options.length
  } else if (event.key === 'Home') {
    event.preventDefault()
    nextIndex = 0
  } else if (event.key === 'End') {
    event.preventDefault()
    nextIndex = props.options.length - 1
  }

  if (nextIndex >= 0) {
    const nextOption = props.options[nextIndex]
    if (!nextOption) {
      return
    }
    model.value = nextOption.value
    const target = event.currentTarget as HTMLElement
    const buttons = target.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    buttons[nextIndex]?.focus()
  }
}
</script>

<template>
  <div v-if="variant === 'pill'" role="group" :aria-label="label || undefined" class="tb-row tb-row--gap-2 tb-row--wrap">
    <span v-if="label" class="tb-label tb-label--inline">{{ label }}</span>
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :disabled="disabled"
      :title="option.title"
      :aria-pressed="model === option.value"
      class="tb-btn-pill"
      :class="{
        'tb-btn-pill--active': model === option.value,
        'tb-btn-pill--sm': size === 'sm',
      }"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>

  <div v-else-if="variant === 'segmented'" class="tb-row">
    <span class="tb-label tb-label--inline">{{ label }}</span>
    <div role="group" :aria-label="label || undefined" class="tb-toggle-group tb-toggle-group--sm">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        :disabled="disabled"
        :aria-pressed="model === option.value"
        class="tb-toggle-group__btn"
        :class="{ 'tb-toggle-group__btn--active': model === option.value }"
        :title="option.description"
        @click="model = option.value"
      >
        {{ option.label }}
      </button>
    </div>
    <span v-if="options.find(option => option.value === model)?.description" class="tb-text-tiny tb-text-muted tb-sm-show">
      {{ options.find(option => option.value === model)?.description }}
    </span>
  </div>

  <div v-else-if="variant === 'tab'" role="tablist" :aria-label="label || undefined" class="tb-tab-bar" @keydown="handleTabKeydown">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="tab"
      :disabled="disabled"
      :aria-selected="model === option.value"
      :tabindex="model === option.value ? 0 : -1"
      class="tb-tab-bar__tab"
      :class="{ 'tb-tab-bar__tab--active': model === option.value }"
      @click="model = option.value"
    >
      {{ option.label }}
      <span v-if="option.badge !== undefined" class="tb-tab-bar__badge">{{ option.badge }}</span>
    </button>
  </div>
</template>
