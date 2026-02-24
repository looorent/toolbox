<script setup lang="ts">
import type { CapturedRequest, WebhookMetadata } from '@shared/modules/webhook/types'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createWebhook, deleteWebhook, fetchRequests, fetchWebhook, getWebhookUrl } from './logic'
import WebhookLanding from './WebhookLanding.vue'
import WebhookRequestDetail from './WebhookRequestDetail.vue'
import WebhookRequestList from './WebhookRequestList.vue'
import WebhookRequestSender from './WebhookRequestSender.vue'
import WebhookToolbar from './WebhookToolbar.vue'

const POLL_INTERVAL_MS = 2500

const route = useRoute()
const router = useRouter()

const webhookId = computed(() => route.params.id as string | undefined)
const webhook = ref<WebhookMetadata | null>(null)
const requests = ref<CapturedRequest[]>([])
const selectedRequest = ref<CapturedRequest | null>(null)
const isCreating = ref(false)
const isDeleting = ref(false)
const isLoadingMore = ref(false)
const loadError = ref<string | null>(null)
const pollingIntervalId = ref<number | null>(null)
const originalTitle = ref('')
const unreadCount = ref(0)
const nextCursor = ref<string | null>(null)
const hasMore = ref(false)
const showSender = ref(false)

const webhookUrl = computed(() => (webhookId.value ? getWebhookUrl(webhookId.value) : ''))

async function handleCreateWebhook(): Promise<void> {
  isCreating.value = true
  loadError.value = null
  try {
    const created = await createWebhook()
    await router.push(`/webhook/${created.id}`)
  } catch {
    loadError.value = 'Failed to create webhook. Please try again.'
  } finally {
    isCreating.value = false
  }
}

async function handleDeleteWebhook(): Promise<void> {
  if (webhookId.value) {
    isDeleting.value = true
    try {
      await deleteWebhook(webhookId.value)
      await router.push('/webhook')
    } catch {
      loadError.value = 'Failed to delete webhook.'
    } finally {
      isDeleting.value = false
    }
  }
}

async function initWebhook(): Promise<void> {
  if (webhookId.value) {
    try {
      const [meta, page] = await Promise.all([fetchWebhook(webhookId.value), fetchRequests(webhookId.value)])
      webhook.value = meta
      requests.value = page.requests
      nextCursor.value = page.nextCursor
      hasMore.value = page.hasMore
      loadError.value = null
    } catch {
      loadError.value = 'Failed to load webhook data.'
    }
  }
}

async function pollForNewRequests(): Promise<void> {
  if (webhookId.value && webhook.value !== null) {
    try {
      const page = await fetchRequests(webhookId.value)
      const knownIds = new Set(requests.value.map(request => request.id))
      const newRequests = page.requests.filter(request => !knownIds.has(request.id))
      if (newRequests.length > 0) {
        requests.value = [...newRequests, ...requests.value]
        if (document.hidden) {
          unreadCount.value += newRequests.length
          document.title = `(${unreadCount.value}) Webhook Catcher`
        }
      }
      loadError.value = null
    } catch {
      loadError.value = 'Failed to load webhook data.'
    }
  }
}

async function loadMoreRequests(): Promise<void> {
  if (webhookId.value && nextCursor.value) {
    isLoadingMore.value = true
    try {
      const page = await fetchRequests(webhookId.value, nextCursor.value)
      requests.value = [...requests.value, ...page.requests]
      nextCursor.value = page.nextCursor
      hasMore.value = page.hasMore
      loadError.value = null
    } catch {
      loadError.value = 'Failed to load more requests.'
    } finally {
      isLoadingMore.value = false
    }
  }
}

function startPolling(): void {
  pollingIntervalId.value = window.setInterval(pollForNewRequests, POLL_INTERVAL_MS)
}

function stopPolling(): void {
  if (pollingIntervalId.value !== null) {
    clearInterval(pollingIntervalId.value)
    pollingIntervalId.value = null
  }
}

function handleVisibilityChange(): void {
  if (!document.hidden) {
    unreadCount.value = 0
    document.title = originalTitle.value
  }
}

function selectRequest(request: CapturedRequest): void {
  if (selectedRequest.value?.id === request.id) {
    selectedRequest.value = null
  } else {
    selectedRequest.value = request
  }
}

onMounted(() => {
  originalTitle.value = document.title
  document.addEventListener('visibilitychange', handleVisibilityChange)
  if (webhookId.value) {
    initWebhook()
    startPolling()
  }
})

onUnmounted(() => {
  stopPolling()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  document.title = originalTitle.value
})

function toggleSender(): void {
  showSender.value = !showSender.value
}

watch(webhookId, () => {
  stopPolling()
  webhook.value = null
  requests.value = []
  selectedRequest.value = null
  unreadCount.value = 0
  nextCursor.value = null
  hasMore.value = false
  showSender.value = false
  document.title = originalTitle.value
  if (webhookId.value) {
    initWebhook()
    startPolling()
  }
})
</script>

<template>
  <div class="flex flex-col h-full gap-6">
    <WebhookLanding
      v-if="!webhookId"
      :is-creating="isCreating"
      :load-error="loadError"
      @create="handleCreateWebhook"
    />

    <div v-else class="flex flex-col flex-1 gap-4 min-h-0">
      <WebhookToolbar
        :webhook-url="webhookUrl"
        :is-creating="isCreating"
        :is-deleting="isDeleting"
        :show-sender="showSender"
        @create="handleCreateWebhook"
        @delete="handleDeleteWebhook"
        @toggle-sender="toggleSender"
      />

      <WebhookRequestSender
        v-if="showSender"
        :webhook-url="webhookUrl"
      />

      <p v-if="loadError" class="text-sm text-error">{{ loadError }}</p>

      <div class="flex flex-1 gap-4 min-h-0">
        <WebhookRequestList
          :webhook="webhook"
          :requests="requests"
          :selected-request-id="selectedRequest?.id ?? null"
          :has-more="hasMore"
          :is-loading-more="isLoadingMore"
          @select="selectRequest"
          @load-more="loadMoreRequests"
        />
        <WebhookRequestDetail :request="selectedRequest" />
      </div>
    </div>
  </div>
</template>
