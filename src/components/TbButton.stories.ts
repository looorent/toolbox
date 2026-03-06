import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TbButton from './TbButton.vue'

const meta: Meta<typeof TbButton> = {
  component: TbButton,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbButton>

export const Primary: Story = {
  render: () => ({
    components: { TbButton },
    template: '<TbButton variant="primary">Generate</TbButton>',
  }),
}

export const Secondary: Story = {
  render: () => ({
    components: { TbButton },
    template: '<TbButton variant="secondary">Copy All</TbButton>',
  }),
}

export const Ghost: Story = {
  render: () => ({
    components: { TbButton },
    template: '<TbButton variant="ghost">Load sample</TbButton>',
  }),
}

export const Danger: Story = {
  render: () => ({
    components: { TbButton },
    template: '<TbButton variant="danger">Delete</TbButton>',
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { TbButton },
    template: '<TbButton variant="primary" :disabled="true">Disabled</TbButton>',
  }),
}

export const SmallPrimary: Story = {
  render: () => ({
    components: { TbButton },
    template: '<TbButton variant="primary" size="sm">Apply fix</TbButton>',
  }),
}

export const SmallSecondary: Story = {
  render: () => ({
    components: { TbButton },
    template: '<TbButton variant="secondary" size="sm">Load sample</TbButton>',
  }),
}
