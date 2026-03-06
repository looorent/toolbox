import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TbTag from './TbTag.vue'

const meta: Meta<typeof TbTag> = {
  component: TbTag,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbTag>

export const Default: Story = {
  render: () => ({
    components: { TbTag },
    template: '<TbTag>*.example.com</TbTag>',
  }),
}

export const Small: Story = {
  render: () => ({
    components: { TbTag },
    template: '<TbTag size="sm">alice.johnson</TbTag>',
  }),
}

export const Copyable: Story = {
  render: () => ({
    components: { TbTag },
    template: `
      <div class="tb-row tb-row--wrap tb-row--gap-3">
        <TbTag copyable="example.com">example.com</TbTag>
        <TbTag copyable="*.example.com">*.example.com</TbTag>
      </div>
    `,
  }),
}

export const Multiple: Story = {
  render: () => ({
    components: { TbTag },
    template: `
      <div class="tb-row tb-row--wrap tb-row--gap-3">
        <TbTag size="sm">alice.johnson</TbTag>
        <TbTag size="sm">bob.smith</TbTag>
        <TbTag size="sm">carol.white</TbTag>
      </div>
    `,
  }),
}
