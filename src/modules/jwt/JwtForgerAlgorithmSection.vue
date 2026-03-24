<script setup lang="ts">
import { TbCard, TbOptionGroup } from '@components'
import { computed } from 'vue'
import { ALGORITHM_CATALOG, ALGORITHM_FAMILIES, algorithmFamily, familyVariants } from './forger-logic'
import type { AlgorithmFamily, SigningAlgorithm } from './forger-types'

const algorithm = defineModel<SigningAlgorithm>({ required: true })

const selectedFamily = computed(() => algorithmFamily(algorithm.value))

const familyOptions = ALGORITHM_FAMILIES.map(family => ({
  value: family.value,
  label: family.label,
}))

const variantOptions = computed(() =>
  familyVariants(selectedFamily.value).map(info => ({
    value: info.value,
    label: info.label,
  })),
)

const selectedInfo = computed(() => ALGORITHM_CATALOG.find(entry => entry.value === algorithm.value))

function onFamilyChange(value: string) {
  const family = value as AlgorithmFamily
  const variants = familyVariants(family)
  if (variants.length > 0) {
    algorithm.value = variants[0].value
  }
}
</script>

<template>
  <TbCard sectioned title="Algorithm">
    <div class="tb-stack-4">
      <TbOptionGroup
        :model-value="selectedFamily"
        :options="familyOptions"
        variant="pill"
        label="Family"
        @update:model-value="onFamilyChange"
      />

      <TbOptionGroup
        v-if="variantOptions.length > 1"
        v-model="algorithm"
        :options="variantOptions"
        variant="segmented"
        label="Variant"
      />

      <p v-if="selectedInfo" class="tb-text-description tb-leading-relaxed">
        {{ selectedInfo.description }}
      </p>
    </div>
  </TbCard>
</template>
