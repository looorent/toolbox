import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags } from '@lezer/highlight'

const editorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--color-surface-overlay)',
    color: 'var(--color-text-primary)',
    fontSize: 'var(--text-sm)',
    fontFamily: 'var(--font-mono)',
  },
  '.cm-content': {
    caretColor: 'var(--color-accent)',
    padding: 'var(--spacing-6) 0',
    fontFamily: 'var(--font-mono)',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--color-accent)',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'var(--color-accent-20)',
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--color-accent-5)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--color-surface-raised)',
    color: 'var(--color-text-muted)',
    border: 'none',
    borderRight: '1px solid var(--color-border)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--color-accent-5)',
    color: 'var(--color-text-secondary)',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 var(--spacing-4) 0 var(--spacing-6)',
    minWidth: '2.5rem',
    fontSize: 'var(--text-xs)',
  },
  '.cm-foldGutter .cm-gutterElement': {
    padding: '0 var(--spacing-2)',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
  },
  '&.cm-focused .cm-matchingBracket': {
    backgroundColor: 'var(--color-accent-20)',
    outline: '1px solid var(--color-accent-40)',
  },
  '.cm-panels': {
    backgroundColor: 'var(--color-surface-raised)',
    color: 'var(--color-text-primary)',
    borderBottom: '1px solid var(--color-border)',
  },
  '.cm-searchMatch': {
    backgroundColor: 'var(--color-warning-20)',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'var(--color-accent-30)',
  },
  '.cm-placeholder': {
    color: 'var(--color-text-muted)',
    fontStyle: 'italic',
  },
  '.cm-tooltip': {
    backgroundColor: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-md)',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-muted)',
    padding: '0 var(--spacing-2)',
  },
  '.cm-diagnostic': {
    padding: 'var(--spacing-4) var(--spacing-6)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--leading-relaxed)',
    whiteSpace: 'pre-wrap',
  },
  '.cm-diagnostic-error': {
    borderLeftColor: 'var(--color-error)',
  },
  '.cm-lintRange-error': {
    backgroundImage: 'none',
    textDecoration: 'wavy underline var(--color-error)',
    textUnderlineOffset: '3px',
  },
  '.cm-lint-marker-error': {
    content: '"●"',
    color: 'var(--color-error)',
  },
  '.cm-panel.cm-panel-lint': {
    backgroundColor: 'var(--color-surface-raised)',
    borderTop: '1px solid var(--color-border)',
  },
  '.cm-panel.cm-panel-lint ul [aria-selected]': {
    backgroundColor: 'var(--color-accent-10)',
  },
  '.cm-scroller': {
    scrollbarWidth: 'thin',
    scrollbarColor: 'var(--color-border) transparent',
    overflow: 'auto',
  },
})

const highlightStyle = HighlightStyle.define([
  { tag: tags.string, color: 'var(--color-success)' },
  { tag: tags.number, color: 'var(--color-warning)' },
  { tag: tags.bool, color: 'var(--color-warning)' },
  { tag: tags.null, color: 'var(--color-text-muted)' },
  { tag: tags.propertyName, color: 'var(--color-accent-text)' },
  { tag: tags.punctuation, color: 'var(--color-text-secondary)' },
  { tag: tags.comment, color: 'var(--color-text-muted)', fontStyle: 'italic' },
])

export const toolboxTheme = [editorTheme, syntaxHighlighting(highlightStyle)]
