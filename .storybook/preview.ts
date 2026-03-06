import type { Preview } from 'storybook/vue3-vite'
import { create } from 'storybook/theming/create'
import '../src/style.css'
import '../src/css/index.css'

const docsTheme = create({
  base: 'dark',
  fontBase: '"Inter", ui-sans-serif, system-ui, sans-serif',
  fontCode: '"JetBrains Mono", ui-monospace, monospace',
  colorPrimary: '#5f61e8',
  colorSecondary: '#5f61e8',
  appBg: '#0f1117',
  appContentBg: '#0f1117',
  textColor: '#e2e8f0',
  textMutedColor: '#7a8a9b',
  barBg: '#1a1d2e',
})

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0f1117' }],
    },
    docs: {
      theme: docsTheme,
    },
  },
}

export default preview
