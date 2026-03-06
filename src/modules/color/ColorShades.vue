<script setup lang="ts">
import { TbCard, TbSwatch } from '@components'
import { useCopy } from '@composables/useCopy'

defineProps<{
  shades: string[]
}>()

const emit = defineEmits<{
  selectColor: [color: string]
}>()

const { copy, copiedKey } = useCopy()

function handleShadeClick(shade: string, shadeIndex: number) {
  copy(`shade-${shadeIndex}`, shade.toUpperCase())
  emit('selectColor', shade)
}
</script>

<template>
  <TbCard title="Shades" class="tb-stack-3">
    <div class="tb-row tb-row--gap-1 tb-overflow-hidden tb-rounded-sm">
      <TbSwatch
        v-for="(shade, shadeIndex) in shades"
        :key="shadeIndex"
        :color="shade"
        :copied="copiedKey === `shade-${shadeIndex}`"
        variant="strip"
        @click="handleShadeClick(shade, shadeIndex)"
      />
    </div>
  </TbCard>
</template>