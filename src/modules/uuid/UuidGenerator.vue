<script setup lang="ts">
import { ref } from 'vue'
import { generateUuids } from './logic'
import UuidList from './UuidList.vue'
import UuidToolbar from './UuidToolbar.vue'

const uuids = ref<string[]>([])
const count = ref(1)

function generate() {
  uuids.value = generateUuids(count.value)
}

generate()
</script>

<template>
  <div class="space-y-6">
    <UuidToolbar v-model:count="count" :uuids="uuids" @generate="generate" />
    <UuidList :uuids="uuids" />
  </div>
</template>
