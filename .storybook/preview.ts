import type { Preview } from 'storybook/vue3-vite'
import { create } from 'storybook/theming/create'
import '../src/style.css'
import '../src/css/index.css'

const docsTheme = create({
  base: 'dark',
  fontBase: '"Inter", ui-sans-serif, system-ui, sans-serif',
  fontCode: '"JetBrains Mono", ui-monospace, monospace',
  colorPrimary: '#7a9a60',
  colorSecondary: '#7a9a60',
  appBg: '#0e120f',
  appContentBg: '#0e120f',
  textColor: '#dce4d0',
  textMutedColor: '#56634e',
  barBg: '#181e1a',
})

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0e120f' }],
    },
    docs: {
      theme: docsTheme,
    },
  },
}

export default preview
