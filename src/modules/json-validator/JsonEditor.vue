<script setup lang="ts">
import { useJsonEditor } from '@composables/useJsonEditor';
import { computed, ref } from 'vue';
import type { JsonEditorStatus } from './types';

const modelValue = defineModel<string>({ required: true })

const props = defineProps<{
  status: JsonEditorStatus
  errorLine: number
}>()

const editorRef = ref<HTMLTextAreaElement | null>(null)
const { handleKeydown } = useJsonEditor(modelValue, editorRef)

const lineCount = computed(() => (modelValue.value || ' ').split('\n').length)

const borderClass = computed(() => {
  switch (props.status) {
    case 'idle':
      return 'border-border'
    case 'valid':
      return 'border-success/40'
    case 'invalid':
      return 'border-error/40'
  }
})
</script>

<template>
  <div
    class="relative rounded-lg border overflow-hidden transition-colors"
    :class="borderClass"
  >
    <div class="flex">
      <div
        class="select-none py-3 pl-3 pr-2 text-right text-[11px] font-mono leading-[1.625rem] text-text-muted bg-surface-raised border-r border-border min-w-[3rem]"
        aria-hidden="true"
      >
        <div
          v-for="lineNumber in lineCount"
          :key="lineNumber"
          :class="lineNumber === errorLine ? 'text-error font-bold' : ''"
        >{{ lineNumber }}</div>
      </div>
      <textarea
        ref="editorRef"
        v-model="modelValue"
        placeholder="Paste your JSON here..."
        spellcheck="false"
        class="flex-1 bg-surface-overlay px-4 py-3 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none resize-y min-h-[200px] leading-[1.625rem]"
        @keydown="handleKeydown"
      />
    </div>
  </div>
</template>
