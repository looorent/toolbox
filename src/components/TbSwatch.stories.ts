import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TbSwatch from './TbSwatch.vue'

const meta: Meta<typeof TbSwatch> = {
  component: TbSwatch,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbSwatch>

export const Default: Story = {
  render: () => ({
    components: { TbSwatch },
    template: `
      <div class="tb-row tb-row--gap-2" class="tb-h-12">
        <TbSwatch color="#3b82f6" />
      </div>
    `,
  }),
}

export const Copied: Story = {
  render: () => ({
    components: { TbSwatch },
    template: `
      <div class="tb-row tb-row--gap-2" class="tb-h-12">
        <TbSwatch color="#3b82f6" :copied="true" />
      </div>
    `,
  }),
}

export const Strip: Story = {
  render: () => ({
    components: { TbSwatch },
    template: `
      <div class="tb-row tb-h-8">
        <TbSwatch color="#ef4444" variant="strip" />
        <TbSwatch color="#f97316" variant="strip" />
        <TbSwatch color="#eab308" variant="strip" />
        <TbSwatch color="#22c55e" variant="strip" />
        <TbSwatch color="#3b82f6" variant="strip" />
        <TbSwatch color="#8b5cf6" variant="strip" />
      </div>
    `,
  }),
}

export const Palette: Story = {
  render: () => ({
    components: { TbSwatch },
    template: `
      <div class="tb-row tb-row--gap-2" class="tb-h-12">
        <TbSwatch color="#1e3a5f" />
        <TbSwatch color="#3b82f6" />
        <TbSwatch color="#93c5fd" />
        <TbSwatch color="#dbeafe" />
      </div>
    `,
  }),
}
