<script setup lang="ts">
import { computed, ref } from 'vue'
import JsonAutoFixPanel from './JsonAutoFixPanel.vue'
import JsonDiagnosticCard from './JsonDiagnosticCard.vue'
import JsonEditor from './JsonEditor.vue'
import JsonToolbar from './JsonToolbar.vue'
import { resultToEditorStatus, validateJson } from './logic'
import type { JsonEditorStatus } from './types'

const input = ref('')

const result = computed(() => validateJson(input.value))

const editorStatus = computed<JsonEditorStatus>(() => resultToEditorStatus(result.value))

const errorLine = computed(() => {
  if (result.value.kind !== 'invalid' || result.value.diagnostics.length === 0) {
    return -1
  } else {
    return result.value.diagnostics[0]?.line ?? -1
  }
})

const inputLines = computed(() => input.value.split('\n'))

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

function offendingLineAt(line: number): string | null {
  return inputLines.value[line - 1] ?? null
}
</script>

<template>
  <div class="space-y-5">
    <p class="text-sm text-text-secondary">Validate, format, and fix JSON. Errors are explained in plain English.</p>

    <JsonToolbar
      :result="result"
      @format="format"
      @minify="minify"
      @load-sample="loadSample"
    />

    <JsonEditor
      v-model="input"
      :status="editorStatus"
      :error-line="errorLine"
    />

    <div v-if="result.kind === 'invalid' && result.diagnostics.length > 0" class="space-y-3">
      <JsonDiagnosticCard
        v-for="(diagnostic, index) in result.diagnostics"
        :key="index"
        :diagnostic="diagnostic"
        :offending-line="offendingLineAt(diagnostic.line)"
      />

      <JsonAutoFixPanel
        v-if="result.fixedJson"
        :fix-summary="result.fixSummary"
        @apply-fix="applyFix"
      />
    </div>
  </div>
</template>
