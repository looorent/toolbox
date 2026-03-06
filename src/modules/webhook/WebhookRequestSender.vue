<script setup lang="ts">
import { TbButton, TbCard, TbInput } from '@components'
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

function statusBadgeClass(status: number): string {
  if (status >= 200 && status < 300) {
    return 'tb-badge--valid'
  } else if (status >= 400) {
    return 'tb-badge--invalid'
  } else {
    return ''
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
  <TbCard class="tb-stack-3 tb-card--raised">
    <!-- Header -->
    <div class="tb-row tb-row--between">
      <h2 class="tb-section-subtitle">Send Request</h2>
      <TbButton
        variant="secondary"
        size="sm"
        :class="copiedKey === 'openapi' ? 'tb-text-success' : ''"
        title="Copy OpenAPI 3.0 spec URL (importable in Postman, Insomnia, etc.)"
        @click="copyOpenApiUrl"
      >
        <svg class="tb-icon-sm" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        {{ copiedKey === 'openapi' ? 'Copied!' : 'OpenAPI' }}
      </TbButton>
    </div>

    <!-- Method selector + URL -->
    <div class="tb-row">
      <div class="tb-toggle-group tb-toggle-group--sm tb-flex-shrink-0">
        <button
          v-for="method in METHODS"
          :key="method"
          type="button"
          class="tb-toggle-group__btn tb-font-mono tb-font-bold"
          :class="selectedMethod === method ? methodColor(method) : ''"
          @click="selectMethod(method)"
        >
          {{ method }}
        </button>
      </div>
      <code class="tb-code-block tb-hint tb-truncate tb-flex-fill">{{ webhookUrl }}</code>
    </div>

    <!-- Preset templates -->
    <div class="tb-row tb-row--wrap">
      <span class="tb-text-muted tb-text-tiny tb-flex-shrink-0">Presets:</span>
      <button
        v-for="preset in PRESETS"
        :key="preset.label"
        type="button"
        class="tb-chip"
        @click="applyPreset(preset)"
      >
        {{ preset.label }}
      </button>
    </div>

    <!-- Body -->
    <div v-if="bodyVisible" class="tb-stack-1">
      <div class="tb-row">
        <label class="tb-text-muted tb-text-tiny">Body</label>
        <TbInput
          v-model="contentType"
          class="tb-input--small tb-flex-1 tb-max-w-64"
          placeholder="Content-Type"
        />
      </div>
      <textarea
        v-model="body"
        rows="6"
        class="tb-textarea tb-text-xs"
        placeholder="Request body…"
      />
    </div>

    <!-- Custom headers -->
    <div class="tb-stack-1">
      <div class="tb-row">
        <span class="tb-text-muted tb-text-tiny">Headers</span>
        <button
          type="button"
          class="tb-chip"
          @click="addHeader"
        >
          + Add
        </button>
      </div>
      <div v-if="customHeaders.length > 0" class="tb-stack-1">
        <div
          v-for="(header, index) in customHeaders"
          :key="index"
          class="tb-row"
        >
          <TbInput
            v-model="header.key"
            class="tb-input--small tb-w-40"
            placeholder="Header-Name"
          />
          <TbInput
            v-model="header.value"
            class="tb-input--small tb-flex-1"
            placeholder="value"
          />
          <button
            type="button"
            class="tb-btn-icon tb-btn-icon--danger tb-flex-shrink-0"
            aria-label="Remove header"
            @click="removeHeader(index)"
          >
            <svg class="tb-icon-sm" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Send row -->
    <div class="tb-row tb-row--gap-3">
      <TbButton size="sm" :disabled="isSending" @click="sendRequest">
        {{ isSending ? 'Sending…' : 'Send' }}
      </TbButton>
      <span
        v-if="lastResponse !== null"
        role="status"
        class="tb-badge tb-font-mono tb-font-semibold"
        :class="statusBadgeClass(lastResponse.status)"
      >
        {{ lastResponse.status }}
      </span>
      <span v-if="sendError" role="alert" class="tb-text-xs tb-text-error">{{ sendError }}</span>
    </div>
  </TbCard>
</template>
