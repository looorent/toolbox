import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { defineComponent } from 'vue'

const Placeholder = defineComponent({ template: '<div />' })

const meta: Meta<typeof Placeholder> = {
  title: 'Layout/Rows',
  component: Placeholder,
  tags: ['autodocs', '!dev'],
}

export default meta
type Story = StoryObj<typeof Placeholder>

export const GapVariants: Story = {
  render: () => ({
    template: `
      <div class="tb-stack-6">
        <div v-for="n in [1, 2, 3, 4]" :key="n">
          <p class="tb-hint tb-mb-4">.tb-row.tb-row--gap-{{ n }}</p>
          <div class="tb-row" :class="'tb-row--gap-' + n">
            <span class="tb-chip">Item A</span>
            <span class="tb-chip">Item B</span>
            <span class="tb-chip">Item C</span>
            <span class="tb-chip">Item D</span>
          </div>
        </div>
      </div>
    `,
  }),
}

export const WrappingRow: Story = {
  render: () => ({
    template: `
      <div>
        <p class="tb-hint tb-mb-4">.tb-row.tb-row--wrap.tb-row--gap-2</p>
        <div class="tb-row tb-row--wrap tb-row--gap-2 tb-max-w-64">
          <span class="tb-chip">Alpha</span>
          <span class="tb-chip">Bravo</span>
          <span class="tb-chip">Charlie</span>
          <span class="tb-chip">Delta</span>
          <span class="tb-chip">Echo</span>
          <span class="tb-chip">Foxtrot</span>
          <span class="tb-chip">Golf</span>
          <span class="tb-chip">Hotel</span>
        </div>
      </div>
    `,
  }),
}
