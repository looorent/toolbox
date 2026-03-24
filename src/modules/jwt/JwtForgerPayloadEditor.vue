<script setup lang="ts">
import { TbButton, TbCard, TbCodeEditor, TbInput } from '@components'
import { computed, ref, watch } from 'vue'
import { buildPayloadJson, datetimeFromEpoch, epochFromDatetime, LIFETIME_SHORTCUTS, nowEpoch, refreshTimestamps, STANDARD_CLAIMS } from './forger-logic'
import type { ClaimEntry } from './forger-types'

const props = defineProps<{
  standardClaims: ClaimEntry[]
  customClaims: ClaimEntry[]
}>()

const emit = defineEmits<{
  'update:standardClaims': [value: ClaimEntry[]]
  'update:customClaims': [value: ClaimEntry[]]
}>()

type PayloadView = 'form' | 'json'
const currentView = ref<PayloadView>('form')

const jsonContent = ref('')
const updatingFromForm = ref(false)

const expandedClaim = ref<string | null>(null)

const payloadJson = computed(() => buildPayloadJson(props.standardClaims, props.customClaims))

watch(payloadJson, newJson => {
  if (currentView.value === 'form') {
    updatingFromForm.value = true
    jsonContent.value = newJson
    requestAnimationFrame(() => {
      updatingFromForm.value = false
    })
  }
}, { immediate: true })

watch(jsonContent, newJson => {
  if (updatingFromForm.value || currentView.value !== 'json') {
    return
  }
  try {
    const parsed = JSON.parse(newJson) as Record<string, unknown>
    const updatedStandard = props.standardClaims.map(claim => {
      if (claim.key in parsed) {
        const definition = STANDARD_CLAIMS.find(definition => definition.key === claim.key)
        let value: string
        if (definition?.inputType === 'timestamp' && typeof parsed[claim.key] === 'number') {
          const date = new Date((parsed[claim.key] as number) * 1000)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          value = `${year}-${month}-${day}T${hours}:${minutes}`
        } else if (typeof parsed[claim.key] === 'object') {
          value = JSON.stringify(parsed[claim.key])
        } else {
          value = String(parsed[claim.key])
        }
        return { ...claim, value, enabled: true }
      } else {
        return { ...claim, enabled: false }
      }
    })
    emit('update:standardClaims', updatedStandard)

    const standardKeys = new Set(STANDARD_CLAIMS.map(claim => claim.key))
    const updatedCustom = Object.entries(parsed)
      .filter(([key]) => !standardKeys.has(key))
      .map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        enabled: true,
      }))
    emit('update:customClaims', updatedCustom)
  } catch {
    // Invalid JSON while typing — ignore
  }
})

const claimsWithDefinitions = computed(() =>
  props.standardClaims
    .map((claim, index) => {
      const definition = STANDARD_CLAIMS.find(definition => definition.key === claim.key)
      return definition ? { claim, index, definition } : null
    })
    .filter(entry => entry !== null),
)

function updateStandardClaim(index: number, field: 'enabled' | 'value', value: string | boolean) {
  const updated = [...props.standardClaims]
  updated[index] = { ...updated[index], [field]: value }
  emit('update:standardClaims', updated)
}

function toggleDescription(key: string) {
  if (expandedClaim.value === key) {
    expandedClaim.value = null
  } else {
    expandedClaim.value = key
  }
}

function addCustomClaim() {
  emit('update:customClaims', [...props.customClaims, { key: '', value: '', enabled: true }])
}

function updateCustomClaim(index: number, field: 'key' | 'value', value: string) {
  const updated = [...props.customClaims]
  updated[index] = { ...updated[index], [field]: value }
  emit('update:customClaims', updated)
}

function removeCustomClaim(index: number) {
  const updated = props.customClaims.filter((_, itemIndex) => itemIndex !== index)
  emit('update:customClaims', updated)
}

function setView(view: PayloadView) {
  if (view === 'json') {
    jsonContent.value = payloadJson.value
  }
  currentView.value = view
}

function epochTag(claim: ClaimEntry): number | null {
  const epoch = epochFromDatetime(claim.value)
  return epoch !== null ? epoch : null
}

function applyLifetime(seconds: number) {
  const now = nowEpoch()
  const updated = props.standardClaims.map(claim => {
    if (claim.key === 'exp') {
      return { ...claim, value: datetimeFromEpoch(now + seconds), enabled: true }
    } else if (claim.key === 'iat' && claim.enabled) {
      return { ...claim, value: datetimeFromEpoch(now) }
    } else {
      return claim
    }
  })
  emit('update:standardClaims', updated)
}

function onRefresh() {
  emit('update:standardClaims', refreshTimestamps(props.standardClaims))
}
</script>

<template>
  <TbCard sectioned title="Payload" title-class="tb-text-jwt-payload">
    <template #actions>
      <div class="tb-row tb-row--gap-1">
        <button
          v-for="view in (['form', 'json'] as const)"
          :key="view"
          type="button"
          class="tb-btn-mini"
          :class="{ 'tb-btn-mini--active': currentView === view }"
          @click="setView(view)"
        >
          {{ view === 'form' ? 'Form' : 'JSON' }}
        </button>
      </div>
    </template>

    <TbCodeEditor
      v-if="currentView === 'json'"
      v-model="jsonContent"
      language="json"
      copyable
    />

    <template v-else>
      <div class="tb-stack-4">
        <div class="tb-stack-1">
          <div class="tb-row tb-row--between">
            <h4 class="tb-section-title">Registered Claims</h4>
            <TbButton variant="ghost" size="sm" @click="onRefresh">Refresh timestamps</TbButton>
          </div>
          <p class="tb-hint">Click the info button to learn about each claim.</p>
        </div>

        <div class="tb-stack-2">
          <template v-for="entry in claimsWithDefinitions" :key="entry.claim.key">
            <div class="tb-row tb-row--gap-2">
              <label class="tb-checkbox tb-flex-shrink-0">
                <input
                  type="checkbox"
                  class="tb-checkbox__input"
                  :checked="entry.claim.enabled"
                  @change="updateStandardClaim(entry.index, 'enabled', ($event.target as HTMLInputElement).checked)"
                >
              </label>

              <span
                class="tb-font-mono tb-text-sm tb-flex-shrink-0 tb-nowrap"
                :class="entry.claim.enabled ? 'tb-text-primary' : 'tb-text-muted'"
                style="width: 5.5rem"
              >{{ entry.definition.key }}</span>

              <span class="tb-text-secondary tb-text-xs tb-flex-shrink-0 tb-nowrap tb-w-40">
                {{ entry.definition.label }}
              </span>

              <template v-if="entry.claim.enabled">
                <input
                  v-if="entry.definition.inputType === 'timestamp'"
                  type="datetime-local"
                  class="tb-input tb-input--small tb-flex-fill tb-min-w-0"
                  :value="entry.claim.value"
                  @input="updateStandardClaim(entry.index, 'value', ($event.target as HTMLInputElement).value)"
                >
                <TbInput
                  v-else
                  :model-value="entry.claim.value"
                  size="sm"
                  class="tb-flex-fill tb-min-w-0"
                  :placeholder="entry.definition.example"
                  @update:model-value="updateStandardClaim(entry.index, 'value', String($event))"
                />
                <span
                  v-if="entry.definition.inputType === 'timestamp' && epochTag(entry.claim) !== null"
                  class="tb-tag tb-tag--sm tb-font-mono tb-text-2xs tb-nowrap"
                >{{ epochTag(entry.claim) }}</span>
                <template v-if="entry.definition.key === 'exp'">
                  <button
                    v-for="shortcut in LIFETIME_SHORTCUTS"
                    :key="shortcut.label"
                    type="button"
                    class="tb-btn-pill tb-btn-pill--sm"
                    @click="applyLifetime(shortcut.seconds)"
                  >
                    {{ shortcut.label }}
                  </button>
                </template>
              </template>
              <span v-else class="tb-flex-fill" />

              <button
                type="button"
                class="tb-btn-icon tb-flex-shrink-0"
                :class="{ 'tb-text-accent': expandedClaim === entry.definition.key }"
                title="Show description"
                @click="toggleDescription(entry.definition.key)"
              >
                <svg class="tb-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="img">
                  <title>Show claim description</title>
                  <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                  <path stroke-linecap="round" stroke-width="1.5" d="M12 16v-4m0-4h.01" />
                </svg>
              </button>
            </div>

            <p v-if="expandedClaim === entry.definition.key" class="tb-hint tb-ml-4">
              {{ entry.definition.description }}
            </p>
          </template>
        </div>

        <div class="tb-stack-2">
          <div class="tb-row tb-row--between">
            <h4 class="tb-section-title">Custom Claims</h4>
            <TbButton variant="ghost" size="sm" @click="addCustomClaim">Add claim</TbButton>
          </div>

          <div v-if="customClaims.length === 0" class="tb-hint">
            No custom claims. Click "Add claim" to add key-value pairs.
          </div>

          <div v-for="(claim, index) in customClaims" :key="index" class="tb-row tb-row--gap-2">
            <TbInput
              :model-value="claim.key"
              placeholder="key"
              size="sm"
              class="tb-w-third"
              @update:model-value="updateCustomClaim(index, 'key', String($event))"
            />
            <TbInput
              :model-value="claim.value"
              placeholder="value (JSON or string)"
              size="sm"
              class="tb-flex-fill"
              @update:model-value="updateCustomClaim(index, 'value', String($event))"
            />
            <button type="button" class="tb-btn-icon tb-btn-icon--danger" @click="removeCustomClaim(index)">
              &times;
            </button>
          </div>
        </div>
      </div>
    </template>
  </TbCard>
</template>
