import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TbStatusBanner from './TbStatusBanner.vue'

const meta: Meta<typeof TbStatusBanner> = {
  component: TbStatusBanner,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbStatusBanner>

export const Valid: Story = {
  args: {
    status: 'valid',
    message: 'Token is valid — expires in 2 hours',
  },
}

export const Expired: Story = {
  args: {
    status: 'expired',
    message: 'Token expired 3 days ago',
  },
}

export const NotYet: Story = {
  args: {
    status: 'not-yet',
    message: 'Token is not yet valid — starts in 1 hour',
  },
}
