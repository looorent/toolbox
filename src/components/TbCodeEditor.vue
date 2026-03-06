<script setup lang="ts">
import { json } from '@codemirror/lang-json'
import { Compartment, type Extension } from '@codemirror/state'
import { placeholder as cmPlaceholder, EditorView } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { toolboxTheme } from './codemirror-theme'
import TbCopyButton from './TbCopyButton.vue'

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<{
  readonly?: boolean
  language?: 'json'
  placeholder?: string
  extensions?: Extension[]
  copyable?: boolean
}>(), {
  readonly: false,
  language: 'json',
  placeholder: '',
  extensions: () => [],
  copyable: false,
})

const containerRef = ref<HTMLDivElement | null>(null)
let view: EditorView | null = null
let updatingFromProp = false

const readonlyCompartment = new Compartment()

function getLanguageExtension() {
  switch (props.language) {
    case 'json': return json()
  }
}

onMounted(() => {
  if (!containerRef.value) {
    return
  }

  const allExtensions = [
    basicSetup,
    toolboxTheme,
    getLanguageExtension(),
    ...props.extensions,
    readonlyCompartment.of([
      EditorView.editable.of(!props.readonly),
      EditorView.contentAttributes.of(props.readonly ? { 'aria-readonly': 'true' } : {}),
    ]),
    EditorView.updateListener.of(update => {
      if (update.docChanged && !updatingFromProp) {
        model.value = update.state.doc.toString()
      }
    }),
  ]

  if (props.placeholder) {
    allExtensions.push(cmPlaceholder(props.placeholder))
  }

  view = new EditorView({
    doc: model.value,
    extensions: allExtensions,
    parent: containerRef.value,
  })
})

onUnmounted(() => {
  if (view) {
    view.destroy()
    view = null
  }
})

watch(model, newValue => {
  if (view && newValue !== view.state.doc.toString()) {
    updatingFromProp = true
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: newValue,
      },
    })
    updatingFromProp = false
  }
})

watch(() => props.readonly, newReadonly => {
  if (view) {
    view.dispatch({
      effects: readonlyCompartment.reconfigure([
        EditorView.editable.of(!newReadonly),
        EditorView.contentAttributes.of(newReadonly ? { 'aria-readonly': 'true' } : {}),
      ]),
    })
  }
})
</script>

<template>
  <div class="tb-relative">
    <div
      ref="containerRef"
      class="tb-code-editor"
      :class="{
        'tb-code-editor--readonly': readonly,
      }"
    />
    <TbCopyButton v-if="copyable" :value="model" class="tb-overlay-tr" />
  </div>
</template>
