import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  framework: '@storybook/vue3-vite',
  stories: ['../src/components/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-vitest']
}

export default config
