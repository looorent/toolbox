import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  framework: '@storybook/vue3-vite',
  stories: ['../src/components/**/*.stories.ts'],
  addons: ['@storybook/addon-docs'],
  viteFinal(config) {
    const blocklist = ['pwa', 'cloudflare', 'workbox']
    function isBlocked(plugin: unknown): boolean {
      if (!plugin) {
        return false
      }
      if (Array.isArray(plugin)) {
        return plugin.some(isBlocked)
      }
      const name = (plugin as { name?: string }).name ?? ''
      return blocklist.some(blocked => name.toLowerCase().includes(blocked))
    }
    config.plugins = config.plugins?.filter(plugin => !isBlocked(plugin))
    return config
  },
}

export default config
