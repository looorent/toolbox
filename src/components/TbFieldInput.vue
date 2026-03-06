<script setup lang="ts">
import { useId } from 'vue'
import TbCopyButton from './TbCopyButton.vue'
import TbInput from './TbInput.vue'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  label: string
  placeholder?: string
  error?: boolean
  errorMessage?: string
  copyable?: boolean
  multiline?: boolean
  rows?: number
}>(), {
  placeholder: '',
  error: false,
  errorMessage: '',
  copyable: false,
  multiline: false,
  rows: 4,
})

const model = defineModel<string | number>({ default: '' })
const inputId = useId()
</script>

<template>
  <div>
    <template v-if="multiline">
      <div class="tb-field-header">
        <label :for="inputId" class="tb-label">{{ label }}</label>
        <slot name="actions">
          <TbCopyButton v-if="model" :value="String(model)" />
        </slot>
      </div>
      <textarea
        :id="inputId"
        v-model="model"
        :placeholder="placeholder"
        :rows="rows"
        class="tb-textarea"
        :class="{ 'tb-textarea--error': error }"
        v-bind="$attrs"
      />
    </template>

    <template v-else>
      <label :for="inputId" class="tb-label">{{ label }}</label>
      <div class="tb-input-wrapper">
        <TbInput
          :id="inputId"
          v-model="model"
          :error="error"
          :placeholder="placeholder"
          :class="{ 'tb-input--with-copy': copyable }"
          v-bind="$attrs"
        />
        <TbCopyButton v-if="copyable && model" :value="String(model)" class="tb-input-wrapper__overlay" />
      </div>
    </template>

    <p v-if="error && errorMessage" role="alert" class="tb-error-text">{{ errorMessage }}</p>
  </div>
</template>
