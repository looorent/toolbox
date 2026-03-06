<script setup lang="ts">
import { TbCodeBlock, TbCopyButton, TbEmptyState, TbHttpMethodBadge, TbKvTable, TbOptionGroup, type TbOptionGroupOption } from '@components'
import type { CapturedRequest } from '@shared/modules/webhook/types'
import { computed, ref, watch } from 'vue'
import { formatBodySize, generateCurlCommand, generateRawRequest, tryFormatJson } from './logic'

type DetailView = 'details' | 'raw' | 'curl'

const detailTabs: TbOptionGroupOption[] = [
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

const formattedBody = computed(() => {
  if (!props.request?.body) {
    return null
  }
  return tryFormatJson(props.request.body) ?? props.request.body
})

const queryParamEntries = computed(() => {
  const entries = Object.entries(props.request?.queryParams ?? {})
  return entries.map(([key, value]) => ({ key, value }))
})

const headerEntries = computed(() =>
  (props.request?.headers ?? []).map(header => ({ key: header.name, value: header.value })),
)

const rawRequest = computed(() => (props.request ? generateRawRequest(props.request) : null))

const curlCommand = computed(() =>
  props.request ? generateCurlCommand(props.request, window.location.origin) : null,
)
</script>

<template>
  <div class="tb-scroll-panel tb-min-w-0">
    <div v-if="!request" class="tb-flex-center tb-h-full">
      <TbEmptyState title="Select a request to inspect it">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="tb-icon-lg tb-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </template>
      </TbEmptyState>
    </div>

    <div v-else class="tb-stack-4 tb-pb-8">
      <!-- Method + path -->
      <div class="tb-row tb-row--gap-3 tb-row--wrap">
        <TbHttpMethodBadge :method="request.method" />
        <span class="tb-font-mono tb-text-sm tb-text-primary tb-break-all">{{ request.path }}</span>
      </div>

      <!-- Meta row -->
      <div class="tb-hint tb-row tb-row--gap-4 tb-row--wrap">
        <span>{{ new Date(request.timestamp).toLocaleString() }}</span>
        <span v-if="request.ip">{{ request.ip }}</span>
        <span v-if="request.contentType">{{ request.contentType }}</span>
      </div>

      <!-- View tabs -->
      <TbOptionGroup v-model="detailView" variant="tab" :options="detailTabs" />

      <!-- Details panel -->
      <div v-if="detailView === 'details'" class="tb-stack-6">
        <!-- Query params -->
        <div v-if="queryParamEntries.length > 0">
          <p class="tb-label">
            Query Params <span class="tb-label__count">({{ queryParamEntries.length }})</span>
          </p>
          <TbKvTable :entries="queryParamEntries" />
        </div>

        <!-- Headers -->
        <div v-if="request.headers.length > 0">
          <p class="tb-label">
            Headers <span class="tb-label__count">({{ request.headers.length }})</span>
          </p>
          <TbKvTable :entries="headerEntries" key-size="lg">
            <template #value="{ entry }">
              <span
                :class="{ 'tb-text-muted tb-italic': entry.value === '[redacted]' }"
              >{{ entry.value }}</span>
            </template>
          </TbKvTable>
        </div>

        <!-- Body -->
        <div>
          <div class="tb-field-header">
            <p class="tb-label tb-label--inline">
              Body<span v-if="request.body" class="tb-label__count">({{ formatBodySize(request.body) }})</span>
            </p>
            <TbCopyButton v-if="request.body" :value="request.body" />
          </div>
          <TbCodeBlock v-if="formattedBody" :value="formattedBody" />
          <p v-else class="tb-text-xs tb-text-muted tb-italic">Empty body</p>
        </div>
      </div>

      <!-- Raw panel -->
      <TbCodeBlock v-else-if="detailView === 'raw' && rawRequest" title="Raw Request" :value="rawRequest" copyable />

      <!-- cURL panel -->
      <TbCodeBlock v-else-if="detailView === 'curl' && curlCommand" title="cURL Command" :value="curlCommand" copyable />
    </div>
  </div>
</template>
