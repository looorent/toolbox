import { ref, watch } from 'vue'

export interface BackwardResult {
  value: string
  error: boolean
}

export interface BidirectionalConverterOptions {
  forward: (value: string) => string | null
  backward: (value: string) => BackwardResult
  initial?: string
}

export function useBidirectionalConverter(options: BidirectionalConverterOptions) {
  const initialRight = options.initial !== undefined ? (options.forward(options.initial) ?? '') : ''

  const left = ref(options.initial ?? '')
  const right = ref(initialRight)
  const error = ref(false)
  const updating = ref(false)

  function applyForward(value: string): void {
    const result = options.forward(value)
    if (result !== null) {
      right.value = result
    }
    error.value = false
  }

  watch(left, newValue => {
    if (!updating.value) {
      updating.value = true
      applyForward(newValue)
      requestAnimationFrame(() => (updating.value = false))
    }
  })

  watch(right, newValue => {
    if (!updating.value) {
      updating.value = true
      const result = options.backward(newValue)
      left.value = result.value
      error.value = result.error
      requestAnimationFrame(() => (updating.value = false))
    }
  })

  function recompute(): void {
    if (left.value) {
      updating.value = true
      applyForward(left.value)
      requestAnimationFrame(() => {
        updating.value = false
      })
    }
  }

  return { left, right, error, recompute }
}
