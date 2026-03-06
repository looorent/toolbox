import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TbStatCard from './TbStatCard.vue'

const meta: Meta<typeof TbStatCard> = {
  component: TbStatCard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbStatCard>

export const Default: Story = {
  args: {
    title: 'Version',
    value: '4',
  },
}

export const MonospaceValue: Story = {
  args: {
    title: 'Byte Length',
    value: '1024',
    valueClass: 'tb-stat-card__value tb-font-mono',
  },
}

export const CustomCopiedLabel: Story = {
  args: {
    title: 'Serial Number',
    value: '0x1A2B3C4D',
    labelCopied: 'Hex copied!',
  },
}

export const WithSlot: Story = {
  render: () => ({
    components: { TbStatCard },
    template: `
      <TbStatCard title="Algorithm" value="RS256">
        <p class="tb-stat-card__value tb-text-accent">RS256</p>
      </TbStatCard>
    `,
  }),
}
