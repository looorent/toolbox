<script setup lang="ts">
import { useCopy } from '@composables/useCopy'
import { computed, ref } from 'vue'
import { methodColor } from './logic'

const props = defineProps<{
  webhookUrl: string
}>()

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'

const METHODS: Method[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']

interface Preset {
  label: string
  method: Method
  contentType: string
  body: string
}

const PRESETS: Preset[] = [
  {
    label: 'JSON',
    method: 'POST',
    contentType: 'application/json',
    body: '{\n  "event": "test",\n  "data": {\n    "key": "value"\n  }\n}',
  },
  {
    label: 'GitHub Push',
    method: 'POST',
    contentType: 'application/json',
    body: '{\n  "ref": "refs/heads/main",\n  "repository": {\n    "full_name": "org/repo"\n  },\n  "pusher": {\n    "name": "alice"\n  },\n  "commits": []\n}',
  },
  {
    label: 'Stripe Event',
    method: 'POST',
    contentType: 'application/json',
    body: '{\n  "id": "evt_test_123",\n  "type": "customer.subscription.created",\n  "data": {\n    "object": {\n      "id": "sub_test_456",\n      "status": "active"\n    }\n  }\n}',
  },
  {
    label: 'Form',
    method: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    body: 'event=test&source=toolbox&timestamp=1234567890',
  },
]

const { copy, copiedKey } = useCopy()

const selectedMethod = ref<Method>('POST')
const contentType = ref('application/json')
const body = ref('{\n  "event": "test",\n  "data": {\n    "key": "value"\n  }\n}')
const customHeaders = ref<{ key: string; value: string }[]>([])
const isSending = ref(false)
const lastResponse = ref<{ status: number; ok: boolean } | null>(null)
const sendError = ref<string | null>(null)

const bodyVisible = computed(() => selectedMethod.value !== 'GET' && selectedMethod.value !== 'HEAD')

function selectMethod(method: Method): void {
  selectedMethod.value = method
}

function applyPreset(preset: Preset): void {
  selectedMethod.value = preset.method
  contentType.value = preset.contentType
  body.value = preset.body
  lastResponse.value = null
  sendError.value = null
}

function addHeader(): void {
  customHeaders.value = [...customHeaders.value, { key: '', value: '' }]
}

function removeHeader(index: number): void {
  customHeaders.value = customHeaders.value.filter((_, headerIndex) => headerIndex !== index)
}

function statusColor(status: number): string {
  if (status >= 200 && status < 300) {
    return 'text-success bg-success/10 border-success/20'
  } else if (status >= 400) {
    return 'text-error bg-error/10 border-error/20'
  } else {
    return 'text-text-muted bg-surface-overlay border-border'
  }
}

function copyOpenApiUrl(): void {
  const parsed = new URL(props.webhookUrl)
  const id = parsed.pathname.split('/').pop()
  copy('openapi', `${parsed.origin}/api/webhooks/${id}/openapi.json`)
}

async function sendRequest(): Promise<void> {
  isSending.value = true
  lastResponse.value = null
  sendError.value = null
  try {
    const headers: Record<string, string> = {}
    if (bodyVisible.value && contentType.value) {
      headers['Content-Type'] = contentType.value
    }
    for (const header of customHeaders.value) {
      if (header.key.trim()) {
        headers[header.key.trim()] = header.value
      }
    }
    const response = await fetch(props.webhookUrl, {
      method: selectedMethod.value,
      headers,
      body: bodyVisible.value && body.value ? body.value : undefined,
    })
    lastResponse.value = { status: response.status, ok: response.ok }
  } catch {
    sendError.value = 'Request failed — check the URL and try again.'
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-3 p-4 bg-surface-raised rounded-lg border border-border">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xs font-semibold text-text-primary">Send Request</h2>
      <button
        type="button"
        class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface border border-border transition-colors cursor-pointer"
        :class="copiedKey === 'openapi' ? 'text-success border-success/20' : 'text-text-secondary hover:border-border-focus hover:text-text-primary'"
        title="Copy OpenAPI 3.0 spec URL (importable in Postman, Insomnia, etc.)"
        @click="copyOpenApiUrl"
      >
        <svg class="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        {{ copiedKey === 'openapi' ? 'Copied!' : 'OpenAPI' }}
      </button>
    </div>

    <!-- Method selector + URL -->
    <div class="flex items-center gap-2">
      <div class="flex rounded-lg border border-border overflow-hidden shrink-0">
        <button
          v-for="method in METHODS"
          :key="method"
          type="button"
          class="px-2.5 py-1.5 text-[10px] font-bold font-mono border-r border-border last:border-r-0 transition-colors cursor-pointer"
          :class="selectedMethod === method
            ? methodColor(method)
            : 'text-text-muted bg-surface hover:bg-surface-overlay'"
          @click="selectMethod(method)"
        >
          {{ method }}
        </button>
      </div>
      <code class="flex-1 min-w-0 text-xs font-mono text-text-muted truncate px-2.5 py-1.5 bg-surface border border-border rounded-lg">{{ webhookUrl }}</code>
    </div>

    <!-- Preset templates -->
    <div class="flex items-center gap-2 flex-wrap">
      <span class="text-[11px] text-text-muted shrink-0">Presets:</span>
      <button
        v-for="preset in PRESETS"
        :key="preset.label"
        type="button"
        class="px-2 py-0.5 text-[11px] rounded border bg-surface border-border text-text-muted hover:border-border-focus hover:text-text-secondary transition-colors cursor-pointer"
        @click="applyPreset(preset)"
      >
        {{ preset.label }}
      </button>
    </div>

    <!-- Body -->
    <div v-if="bodyVisible" class="flex flex-col gap-1.5">
      <div class="flex items-center gap-2">
        <label class="text-[11px] text-text-muted">Body</label>
        <input
          v-model="contentType"
          class="flex-1 max-w-64 px-2 py-0.5 text-[11px] font-mono bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-secondary placeholder-text-muted"
          placeholder="Content-Type"
        />
      </div>
      <textarea
        v-model="body"
        rows="6"
        class="w-full px-3 py-2 text-xs font-mono bg-surface border border-border rounded-lg focus:outline-none focus:border-border-focus text-text-primary placeholder-text-muted resize-y"
        placeholder="Request body…"
      />
    </div>

    <!-- Custom headers -->
    <div class="flex flex-col gap-1.5">
      <div class="flex items-center gap-2">
        <span class="text-[11px] text-text-muted">Headers</span>
        <button
          type="button"
          class="px-1.5 py-0.5 text-[11px] rounded border bg-surface border-border text-text-muted hover:border-border-focus hover:text-text-secondary transition-colors cursor-pointer"
          @click="addHeader"
        >
          + Add
        </button>
      </div>
      <div v-if="customHeaders.length > 0" class="flex flex-col gap-1.5">
        <div
          v-for="(header, index) in customHeaders"
          :key="index"
          class="flex items-center gap-1.5"
        >
          <input
            v-model="header.key"
            class="w-40 px-2 py-1 text-[11px] font-mono bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary placeholder-text-muted"
            placeholder="Header-Name"
          />
          <input
            v-model="header.value"
            class="flex-1 px-2 py-1 text-[11px] font-mono bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary placeholder-text-muted"
            placeholder="value"
          />
          <button
            type="button"
            class="shrink-0 p-1 text-text-muted hover:text-error transition-colors cursor-pointer"
            @click="removeHeader(index)"
          >
            <svg class="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Send row -->
    <div class="flex items-center gap-3">
      <button
        type="button"
        :disabled="isSending"
        class="px-4 py-1.5 text-xs font-medium rounded-lg bg-accent text-white hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        @click="sendRequest"
      >
        {{ isSending ? 'Sending…' : 'Send' }}
      </button>
      <span
        v-if="lastResponse !== null"
        class="px-2 py-0.5 text-xs font-mono font-semibold rounded border"
        :class="statusColor(lastResponse.status)"
      >
        {{ lastResponse.status }}
      </span>
      <span v-if="sendError" class="text-xs text-error">{{ sendError }}</span>
    </div>
  </div>
</template>
