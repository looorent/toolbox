<script setup lang="ts">
import { TbCodeEditor } from '@components'
import { computed, ref } from 'vue'
import JsonToolbar from './JsonToolbar.vue'
import { jsonLinterExtension } from './linter'
import { validateJson } from './logic'

const input = ref('')

const result = computed(() => validateJson(input.value))

const extensions = [jsonLinterExtension]

function applyFix() {
  if (result.value.kind === 'invalid' && result.value.fixedJson) {
    input.value = result.value.fixedJson
  }
}

function format() {
  if (result.value.kind === 'valid') {
    input.value = result.value.formatted
  }
}

function minify() {
  if (result.value.kind === 'valid') {
    input.value = result.value.minified
  }
}

function loadSample() {
  input.value = `{
    "name": "Ada Lovelace",
    "born": 1815,
    "languages": ["English", "French"],
    "known_for": [
      {
        "title": "First computer program",
        "year": 1843
      }
    ],
    "active": true,
    "spouse": null
  }`
}
</script>

<template>
  <div class="tb-module-root">
    <p class="tb-text-description">Validate, format, and fix JSON. Errors are explained in plain English.</p>

    <JsonToolbar
      :result="result"
      @format="format"
      @minify="minify"
      @load-sample="loadSample"
      @apply-fix="applyFix"
    />

    <TbCodeEditor
      v-model="input"
      :extensions="extensions"
      placeholder="Paste your JSON here..."
    />
  </div>
</template>
