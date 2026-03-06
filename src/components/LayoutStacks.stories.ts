import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { defineComponent } from 'vue'

const Placeholder = defineComponent({ template: '<div />' })

const meta: Meta<typeof Placeholder> = {
  title: 'Layout/Stacks',
  component: Placeholder,
  tags: ['autodocs', '!dev'],
}

export default meta
type Story = StoryObj<typeof Placeholder>

export const AllStacks: Story = {
  render: () => ({
    template: `
      <div class="tb-stack-6">
        <div v-for="n in [1, 2, 3, 4, 6]" :key="n">
          <p class="tb-hint tb-mb-4">.tb-stack-{{ n }}</p>
          <div :class="'tb-stack-' + n">
            <div class="tb-card tb-text-description">Item 1</div>
            <div class="tb-card tb-text-description">Item 2</div>
            <div class="tb-card tb-text-description">Item 3</div>
          </div>
        </div>
      </div>
    `,
  }),
}
