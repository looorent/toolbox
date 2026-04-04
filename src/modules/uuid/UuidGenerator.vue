<script setup lang="ts">
import { ref } from 'vue'
import type { UuidVersion } from './types'
import { generateUuids } from './logic'
import UuidAnalyzer from './UuidAnalyzer.vue'
import UuidList from './UuidList.vue'
import UuidToolbar from './UuidToolbar.vue'

const uuids = ref<string[]>([])
const count = ref(1)
const version = ref<UuidVersion>('v4')

function generate() {
  uuids.value = generateUuids(count.value, version.value)
}

generate()
</script>

<template>
  <div class="tb-stack-6">
    <UuidToolbar v-model:count="count" v-model:version="version" :uuids="uuids" @generate="generate" />
    <UuidList :uuids="uuids" :version="version" />
    <UuidAnalyzer />
  </div>
</template>
