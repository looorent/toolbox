import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TbProgressBar from './TbProgressBar.vue'

const meta: Meta<typeof TbProgressBar> = {
  component: TbProgressBar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbProgressBar>

export const Default: Story = {
  args: {
    progress: 0.45,
  },
}

export const WithLabel: Story = {
  args: {
    progress: 0.72,
    label: 'Converting...',
  },
}

export const Complete: Story = {
  args: {
    progress: 1,
    label: 'Upload complete',
  },
}

export const JustStarted: Story = {
  args: {
    progress: 0.05,
    label: 'Uploading...',
  },
}
