<script setup lang="ts">
import CopyButton from '@components/CopyButton.vue'
import type { CapturedRequest } from '@shared/modules/webhook/types'
import { computed, ref, watch } from 'vue'
import { formatBodySize, generateCurlCommand, generateRawRequest, methodColor, tryFormatJson } from './logic'

type DetailView = 'details' | 'raw' | 'curl'

const detailTabs: { value: DetailView; label: string }[] = [
  { value: 'details', label: 'Details' },
  { value: 'raw', label: 'Raw' },
  { value: 'curl', label: 'cURL' },
]

const props = defineProps<{
  request: CapturedRequest | null
}>()

const detailView = ref<DetailView>('details')

watch(
  () => props.request?.id,
  () => {
    detailView.value = 'details'
  },
)

function switchDetailView(view: DetailView): void {
  detailView.value = view
}

const formattedBody = computed(() => {
  if (!props.request?.body) {
    return null
  }
  return tryFormatJson(props.request.body) ?? props.request.body
})

const queryParamEntries = computed(() => Object.entries(props.request?.queryParams ?? {}))

const rawRequest = computed(() => (props.request ? generateRawRequest(props.request) : null))

const curlCommand = computed(() =>
  props.request ? generateCurlCommand(props.request, window.location.origin) : null,
)
</script>

<template>
  <div class="flex-1 overflow-y-auto min-w-0">
    <div v-if="!request" class="flex flex-col items-center justify-center h-full gap-2 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
      </svg>
      <p class="text-sm text-text-muted">Select a request to inspect it</p>
    </div>

    <div v-else class="flex flex-col gap-4 pb-4">
      <!-- Method + path -->
      <div class="flex items-center gap-3 flex-wrap">
        <span
          class="text-xs font-bold font-mono px-2 py-1 rounded border"
          :class="methodColor(request.method)"
        >
          {{ request.method }}
        </span>
        <span class="font-mono text-sm text-text-primary break-all">{{ request.path }}</span>
      </div>

      <!-- Meta row -->
      <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
        <span>{{ new Date(request.timestamp).toLocaleString() }}</span>
        <span v-if="request.ip">{{ request.ip }}</span>
        <span v-if="request.contentType">{{ request.contentType }}</span>
      </div>

      <!-- View tabs -->
      <div class="flex items-center gap-0 border-b border-border">
        <button
          v-for="tab in detailTabs"
          :key="tab.value"
          type="button"
          class="px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors cursor-pointer"
          :class="detailView === tab.value
            ? 'border-accent text-text-primary'
            : 'border-transparent text-text-muted hover:text-text-secondary'"
          @click="switchDetailView(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Details panel -->
      <div v-if="detailView === 'details'" class="space-y-5">
        <!-- Query params -->
        <div v-if="queryParamEntries.length > 0">
          <p class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
            Query Params <span class="font-normal normal-case tracking-normal">({{ queryParamEntries.length }})</span>
          </p>
          <div class="rounded-lg border border-border overflow-hidden">
            <div
              v-for="[key, value] in queryParamEntries"
              :key="key"
              class="flex border-b border-border last:border-0"
            >
              <span class="px-3 py-2 text-xs font-mono text-text-secondary bg-surface-raised w-36 shrink-0 truncate border-r border-border">{{ key }}</span>
              <span class="px-3 py-2 text-xs font-mono text-text-primary break-all">{{ value }}</span>
            </div>
          </div>
        </div>

        <!-- Headers -->
        <div v-if="request.headers.length > 0">
          <p class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
            Headers <span class="font-normal normal-case tracking-normal">({{ request.headers.length }})</span>
          </p>
          <div class="rounded-lg border border-border overflow-hidden">
            <div
              v-for="header in request.headers"
              :key="header.name"
              class="flex border-b border-border last:border-0"
            >
              <span class="px-3 py-2 text-xs font-mono text-text-secondary bg-surface-raised w-48 shrink-0 truncate border-r border-border">{{ header.name }}</span>
              <span
                class="px-3 py-2 text-xs font-mono break-all"
                :class="header.value === '[redacted]' ? 'text-text-muted italic' : 'text-text-primary'"
              >{{ header.value }}</span>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Body<span v-if="request.body" class="font-normal normal-case tracking-normal ml-1">({{ formatBodySize(request.body) }})</span>
            </p>
            <CopyButton v-if="request.body" :value="request.body" />
          </div>
          <pre
            v-if="request.body"
            class="px-4 py-3 rounded-lg bg-surface-overlay border border-border text-xs font-mono text-text-primary whitespace-pre-wrap break-all overflow-x-auto"
          >{{ formattedBody }}</pre>
          <p v-else class="text-xs text-text-muted italic">Empty body</p>
        </div>
      </div>

      <!-- Raw panel -->
      <div v-else-if="detailView === 'raw'">
        <div class="flex items-center justify-between mb-2">
          <p class="text-xs font-semibold uppercase tracking-wider text-text-muted">Raw Request</p>
          <CopyButton v-if="rawRequest" :value="rawRequest" />
        </div>
        <pre class="px-4 py-3 rounded-lg bg-surface-overlay border border-border text-xs font-mono text-text-primary whitespace-pre-wrap break-all overflow-x-auto">{{ rawRequest }}</pre>
      </div>

      <!-- cURL panel -->
      <div v-else>
        <div class="flex items-center justify-between mb-2">
          <p class="text-xs font-semibold uppercase tracking-wider text-text-muted">cURL Command</p>
          <CopyButton v-if="curlCommand" :value="curlCommand" />
        </div>
        <pre class="px-4 py-3 rounded-lg bg-surface-overlay border border-border text-xs font-mono text-text-primary whitespace-pre-wrap break-all overflow-x-auto">{{ curlCommand }}</pre>
      </div>
    </div>
  </div>
</template>
