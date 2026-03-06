import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TbCopyId from './TbCopyId.vue'

const meta: Meta<typeof TbCopyId> = {
  component: TbCopyId,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbCopyId>

export const Default: Story = {
  args: {
    value: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  },
}

export const ShortTruncate: Story = {
  args: {
    value: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    truncate: 4,
  },
}

export const Multiple: Story = {
  render: () => ({
    components: { TbCopyId },
    template: `
      <div class="tb-stack-2">
        <TbCopyId value="a1b2c3d4-e5f6-7890-abcd-ef1234567890" />
        <TbCopyId value="f9e8d7c6-b5a4-3210-fedc-ba9876543210" />
        <TbCopyId value="12345678-90ab-cdef-1234-567890abcdef" :truncate="12" />
      </div>
    `,
  }),
}
