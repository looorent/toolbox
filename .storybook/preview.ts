import type { Preview } from 'storybook/vue3-vite'
import '../src/style.css'
import '../src/css/index.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0f1117' }],
    },
  },
}

export default preview
