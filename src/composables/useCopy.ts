import { computed, ref } from 'vue'

export function useCopy() {
  const copiedKey = ref('')
  const copied = computed(() => copiedKey.value !== '')

  async function copy(keyOrText: string, text?: string | null) {
    const resolvedKey = text !== undefined ? keyOrText : 'copied'
    const resolvedText = text !== undefined ? text : keyOrText

    if (resolvedText) {
      await writeToClipboard(resolvedText)
      copiedKey.value = resolvedKey
      setTimeout(() => {
        if (copiedKey.value === resolvedKey) {
          copiedKey.value = ''
        }
      }, 1500)
    }
  }

  return { copy, copied, copiedKey }
}

async function writeToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Fallback for older browsers / insecure contexts
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}
