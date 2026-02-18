import type { Ref } from 'vue'

const INDENT = '  '
const BRACKET_PAIRS: Record<string, string> = { '{': '}', '[': ']', '"': '"' }
const CLOSING_BRACKETS = new Set(['}', ']'])

export function useJsonEditor(content: Ref<string>, editorRef: Ref<HTMLTextAreaElement | null>) {
  function replaceRange(element: HTMLTextAreaElement, from: number, to: number, text: string) {
    element.focus()
    element.setSelectionRange(from, to)
    document.execCommand('insertText', false, text)
    content.value = element.value
  }

  function handleTab(element: HTMLTextAreaElement, start: number, end: number, value: string, shiftKey: boolean) {
    if (start === end && !shiftKey) {
      replaceRange(element, start, end, INDENT)
    } else {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      const lineEnd = value.indexOf('\n', end)
      const blockEnd = lineEnd === -1 ? value.length : lineEnd
      const block = value.slice(lineStart, blockEnd)
      const blockLines = block.split('\n')

      const shifted = shiftKey
        ? blockLines.map(line => (line.startsWith(INDENT) ? line.slice(INDENT.length) : line.replace(/^\t/, '')))
        : blockLines.map(line => INDENT + line)

      const newBlock = shifted.join('\n')
      replaceRange(element, lineStart, blockEnd, newBlock)
      element.selectionStart = lineStart
      element.selectionEnd = lineStart + newBlock.length
    }
  }

  function handleEnter(element: HTMLTextAreaElement, start: number, end: number, value: string) {
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const currentLine = value.slice(lineStart, start)
    const indentMatch = currentLine.match(/^(\s*)/)
    const baseIndent = indentMatch ? indentMatch[1] : ''

    const charBefore = value[start - 1]
    const charAfter = value[start]
    const isBetweenBrackets = (charBefore === '{' && charAfter === '}') || (charBefore === '[' && charAfter === ']')

    if (isBetweenBrackets) {
      const inner = `\n${baseIndent}${INDENT}`
      const closing = `\n${baseIndent}`
      replaceRange(element, start, end, inner + closing)
      element.selectionStart = element.selectionEnd = start + inner.length
    } else {
      replaceRange(element, start, end, `\n${baseIndent}`)
    }
  }

  function handleAutoClose(element: HTMLTextAreaElement, start: number, end: number, value: string, key: string) {
    const closing = BRACKET_PAIRS[key]
    if (!closing) {
      return false
    }

    if (key === '"' && start > 0 && value[start - 1] === '\\') {
      return false
    }

    if (key === '"' && value[start] === '"') {
      element.selectionStart = element.selectionEnd = start + 1
      return true
    }

    replaceRange(element, start, end, key + closing)
    element.selectionStart = element.selectionEnd = start + 1
    return true
  }

  function handleKeydown(event: KeyboardEvent) {
    const element = editorRef.value
    if (!element) {
      return
    }

    const { selectionStart: start, selectionEnd: end, value } = element

    if (event.key === 'Tab') {
      event.preventDefault()
      handleTab(element, start, end, value, event.shiftKey)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      handleEnter(element, start, end, value)
    } else if (BRACKET_PAIRS[event.key] && start === end) {
      if (handleAutoClose(element, start, end, value, event.key)) {
        event.preventDefault()
      }
    } else if (CLOSING_BRACKETS.has(event.key) && value[start] === event.key && start === end) {
      event.preventDefault()
      element.selectionStart = element.selectionEnd = start + 1
    } else if (event.key === 'Backspace' && start === end && start > 0) {
      const before = value[start - 1]
      const after = value[start]
      if (before && after && BRACKET_PAIRS[before] === after) {
        event.preventDefault()
        replaceRange(element, start - 1, start + 1, '')
      }
    }
  }

  return { handleKeydown }
}
