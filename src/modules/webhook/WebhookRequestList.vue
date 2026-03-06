<script setup lang="ts">
import { TbButton, TbEmptyState, TbHttpMethodBadge } from '@components'
import type { CapturedRequest, WebhookMetadata } from '@shared/modules/webhook/types'
import { formatTimestamp } from './logic'

defineProps<{
  webhook: WebhookMetadata | null
  requests: CapturedRequest[]
  selectedRequestId: string | null
  hasMore: boolean
  isLoadingMore: boolean
}>()

defineEmits<{
  select: [request: CapturedRequest]
  'load-more': []
}>()
</script>

<template>
  <div class="tb-stack-1 tb-webhook-sidebar">
    <div v-if="webhook === null" class="tb-empty-text tb-mt-20">
      Loading…
    </div>

    <template v-else-if="requests.length === 0">
      <TbEmptyState
        title="Waiting for requests…"
        description="Send a request to the webhook URL above to see it appear here."
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="tb-icon-lg tb-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </template>
      </TbEmptyState>
    </template>

    <template v-else>
      <button
        v-for="request in requests"
        :key="request.id"
        type="button"
        class="tb-card tb-card--clickable tb-card--hover tb-request-item"
        :class="{ 'tb-card--selected': selectedRequestId === request.id }"
        @click="$emit('select', request)"
      >
        <TbHttpMethodBadge :method="request.method" size="sm" class="tb-mt-1" />
        <div class="tb-flex-fill">
          <p class="tb-code-inline tb-text-primary tb-truncate">{{ request.path }}</p>
          <p class="tb-text-tiny tb-text-muted tb-mt-1">
            {{ formatTimestamp(request.timestamp) }}<span v-if="request.ip"> · {{ request.ip }}</span>
          </p>
        </div>
      </button>

      <TbButton
        v-if="hasMore"
        variant="ghost"
        size="sm"
        :disabled="isLoadingMore"
        class="tb-w-full"
        @click="$emit('load-more')"
      >
        {{ isLoadingMore ? 'Loading…' : 'Load more' }}
      </TbButton>
    </template>
  </div>
</template>
