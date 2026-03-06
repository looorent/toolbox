<script setup lang="ts">
import type { HttpMethod } from '@shared/modules/webhook/types'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  method: HttpMethod
  size?: 'default' | 'sm'
}>(), {
  size: 'default',
})

const colorClass = computed(() => {
  switch (props.method) {
    case 'GET': return 'tb-http-method-badge--get'
    case 'POST': return 'tb-http-method-badge--post'
    case 'PUT': return 'tb-http-method-badge--put'
    case 'PATCH': return 'tb-http-method-badge--patch'
    case 'DELETE': return 'tb-http-method-badge--delete'
    case 'HEAD': return 'tb-http-method-badge--head'
    case 'OPTIONS': return 'tb-http-method-badge--options'
  }
})
</script>

<template>
  <span
    class="tb-http-method-badge"
    :class="[colorClass, { 'tb-http-method-badge--sm': size === 'sm' }]"
  >
    {{ method }}
  </span>
</template>
