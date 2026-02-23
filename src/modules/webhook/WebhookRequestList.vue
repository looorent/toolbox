<script setup lang="ts">
import type { CapturedRequest, WebhookMetadata } from '@shared/modules/webhook/types'
import { formatTimestamp, methodColor } from './logic'

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
  <div class="w-64 shrink-0 flex flex-col overflow-y-auto gap-1">
    <div v-if="webhook === null" class="text-sm text-text-muted text-center mt-10">
      Loading…
    </div>

    <div v-else-if="requests.length === 0" class="flex flex-col items-center gap-3 mt-10 text-center px-2">
      <div class="w-10 h-10 rounded-full bg-surface-overlay border border-border flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p class="text-sm text-text-muted">Waiting for requests…</p>
      <p class="text-[11px] text-text-muted leading-relaxed">
        Send a request to the webhook URL above to see it appear here.
      </p>
    </div>

    <template v-else>
      <button
        v-for="request in requests"
        :key="request.id"
        type="button"
        class="flex items-start gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-colors w-full shrink-0 cursor-pointer"
        :class="selectedRequestId === request.id
          ? 'bg-surface-raised border-border-focus'
          : 'bg-surface-overlay border-border hover:border-border-focus'"
        @click="$emit('select', request)"
      >
        <span
          class="shrink-0 mt-px text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border"
          :class="methodColor(request.method)"
        >
          {{ request.method }}
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-mono text-text-primary truncate">{{ request.path }}</p>
          <p class="text-[10px] text-text-muted mt-0.5">
            {{ formatTimestamp(request.timestamp) }}<span v-if="request.ip"> · {{ request.ip }}</span>
          </p>
        </div>
      </button>

      <button
        v-if="hasMore"
        type="button"
        :disabled="isLoadingMore"
        class="w-full py-2 text-[11px] text-text-muted hover:text-text-secondary transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        @click="$emit('load-more')"
      >
        {{ isLoadingMore ? 'Loading…' : 'Load more' }}
      </button>
    </template>
  </div>
</template>
