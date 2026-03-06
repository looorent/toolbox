import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TbHttpMethodBadge from './TbHttpMethodBadge.vue'

const meta: Meta<typeof TbHttpMethodBadge> = {
  component: TbHttpMethodBadge,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbHttpMethodBadge>

export const Get: Story = { args: { method: 'GET' } }
export const Post: Story = { args: { method: 'POST' } }
export const Put: Story = { args: { method: 'PUT' } }
export const Patch: Story = { args: { method: 'PATCH' } }
export const Delete: Story = { args: { method: 'DELETE' } }
export const Head: Story = { args: { method: 'HEAD' } }

export const Small: Story = { args: { method: 'POST', size: 'sm' } }

export const AllMethods: Story = {
  render: () => ({
    components: { TbHttpMethodBadge },
    template: `
      <div class="tb-row tb-row--wrap tb-row--gap-4">
        <TbHttpMethodBadge method="GET" />
        <TbHttpMethodBadge method="POST" />
        <TbHttpMethodBadge method="PUT" />
        <TbHttpMethodBadge method="PATCH" />
        <TbHttpMethodBadge method="DELETE" />
        <TbHttpMethodBadge method="HEAD" />
        <TbHttpMethodBadge method="OPTIONS" />
      </div>
    `,
  }),
}
