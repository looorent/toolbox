import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TbCopyButton from './TbCopyButton.vue'

const meta: Meta<typeof TbCopyButton> = {
  component: TbCopyButton,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbCopyButton>

export const Default: Story = {
  args: {
    value: 'Hello, World!',
  },
}

export const CustomLabel: Story = {
  args: {
    value: 'eyJhbGciOiJIUzI1NiJ9',
    label: 'Copy token',
    labelCopied: 'Token copied!',
  },
}
