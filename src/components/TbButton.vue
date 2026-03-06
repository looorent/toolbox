<script setup lang="ts">
export type TbButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type TbButtonSize = 'default' | 'sm'

withDefaults(defineProps<{
  variant?: TbButtonVariant
  size?: TbButtonSize
  disabled?: boolean
}>(), {
  variant: 'primary',
  size: 'default',
  disabled: false,
})
</script>

<template>
  <button
    type="button"
    class="tb-btn"
    :class="[
      {
        'tb-btn-primary': variant === 'primary',
        'tb-btn-secondary': variant === 'secondary',
        'tb-btn-ghost': variant === 'ghost',
        'tb-btn-danger': variant === 'danger',
      },
      size === 'sm' ? 'tb-btn--sm' : '',
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
