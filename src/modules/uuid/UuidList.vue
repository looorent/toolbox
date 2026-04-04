<script setup lang="ts">
import { TbCopyRow } from '@components'
import { computed } from 'vue'
import { extractV7Timestamp } from './logic'
import type { UuidVersion } from './types'

const props = defineProps<{
  uuids: string[]
  version: UuidVersion
}>()

const timestamps = computed(() => props.version !== 'v7' ? [] : props.uuids.map(uuid => extractV7Timestamp(uuid)))
</script>

<template>
  <div class="tb-stack-2">
    <TbCopyRow
      v-for="(uuid, uuidIndex) in uuids"
      :key="uuidIndex"
      :value="uuid"
    >
      <div class="tb-row tb-row--gap-3">
        <code class="tb-text-sm tb-font-mono tb-text-primary">{{ uuid }}</code>
        <span v-if="version === 'v7' && timestamps[uuidIndex]" class="tb-hint tb-font-mono tb-flex-shrink-0">
          {{ timestamps[uuidIndex]?.iso }}
        </span>
      </div>
    </TbCopyRow>
  </div>
</template>
