import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TbCopyRow from './TbCopyRow.vue'

const meta: Meta<typeof TbCopyRow> = {
  component: TbCopyRow,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbCopyRow>

export const Default: Story = {
  render: () => ({
    components: { TbCopyRow },
    template:
      '<TbCopyRow value="550e8400-e29b-41d4-a716-446655440000"><span class="tb-font-mono tb-text-sm">550e8400-e29b-41d4-a716-446655440000</span></TbCopyRow>',
  }),
}

export const WithLabel: Story = {
  render: () => ({
    components: { TbCopyRow },
    template: `
      <TbCopyRow value="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB">
        <span class="tb-text-description">Public Key</span>
        <span class="tb-code-inline tb-truncate tb-flex-fill">ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB</span>
      </TbCopyRow>
    `,
  }),
}
