import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TbCodeBlock from './TbCodeBlock.vue'

const meta: Meta<typeof TbCodeBlock> = {
  component: TbCodeBlock,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbCodeBlock>

export const Default: Story = {
  args: {
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  },
}

export const WithTitle: Story = {
  args: {
    title: 'Header',
    value: '{"alg":"HS256","typ":"JWT"}',
  },
}

export const Copyable: Story = {
  args: {
    value: 'curl -X GET https://api.example.com/v1/users',
    copyable: true,
  },
}
