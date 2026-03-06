<script setup lang="ts">
import { TbOptionGroup, type TbOptionGroupOption } from '@components'
import { ref } from 'vue'
import QrGenerator from './QrGenerator.vue'
import QrScanner from './QrScanner.vue'

const activeTab = ref('generate')

const tabs: TbOptionGroupOption[] = [
  { value: 'generate', label: 'Generate' },
  { value: 'scan', label: 'Scanner' },
]
</script>

<template>
  <div class="tb-stack-6">
    <TbOptionGroup v-model="activeTab" :options="tabs" size="sm" />

    <QrGenerator v-if="activeTab === 'generate'" />
    <QrScanner v-if="activeTab === 'scan'" />
  </div>
</template>
