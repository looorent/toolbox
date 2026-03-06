import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TbKvTable from './TbKvTable.vue'

const meta: Meta<typeof TbKvTable> = {
  component: TbKvTable,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbKvTable>

export const Default: Story = {
  args: {
    entries: [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Authorization', value: 'Bearer eyJhbGci...' },
      { key: 'User-Agent', value: 'Mozilla/5.0' },
    ],
  },
}

export const WideKeys: Story = {
  args: {
    entries: [
      { key: 'Accept-Encoding', value: 'gzip, deflate, br' },
      { key: 'X-Forwarded-For', value: '203.0.113.50' },
    ],
    keySize: 'lg',
  },
}

export const Copyable: Story = {
  args: {
    entries: [
      { key: 'Common Name', value: 'example.com' },
      { key: 'Organization', value: 'Example Inc.' },
      { key: 'Serial Number', value: '03:A1:B2:C3:D4:E5:F6' },
    ],
    copyable: true,
  },
}
