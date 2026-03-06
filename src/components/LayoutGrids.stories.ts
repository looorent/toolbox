import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { defineComponent } from 'vue'

const Placeholder = defineComponent({ template: '<div />' })

const meta: Meta<typeof Placeholder> = {
  title: 'Layout/Grids',
  component: Placeholder,
  tags: ['autodocs', '!dev'],
}

export default meta
type Story = StoryObj<typeof Placeholder>

export const TwoColumn: Story = {
  render: () => ({
    template: `
      <div>
        <p class="tb-hint tb-mb-4">.tb-grid-2</p>
        <div class="tb-grid-2">
          <div class="tb-card tb-text-description tb-text-center">Column 1</div>
          <div class="tb-card tb-text-description tb-text-center">Column 2</div>
          <div class="tb-card tb-text-description tb-text-center">Column 3</div>
          <div class="tb-card tb-text-description tb-text-center">Column 4</div>
        </div>
      </div>
    `,
  }),
}

export const ThreeColumn: Story = {
  render: () => ({
    template: `
      <div>
        <p class="tb-hint tb-mb-4">.tb-grid-3</p>
        <div class="tb-grid-3">
          <div class="tb-card tb-text-description tb-text-center">Column 1</div>
          <div class="tb-card tb-text-description tb-text-center">Column 2</div>
          <div class="tb-card tb-text-description tb-text-center">Column 3</div>
          <div class="tb-card tb-text-description tb-text-center">Column 4</div>
          <div class="tb-card tb-text-description tb-text-center">Column 5</div>
          <div class="tb-card tb-text-description tb-text-center">Column 6</div>
        </div>
      </div>
    `,
  }),
}

export const FourColumn: Story = {
  render: () => ({
    template: `
      <div>
        <p class="tb-hint tb-mb-4">.tb-grid-4</p>
        <div class="tb-grid-4">
          <div class="tb-card tb-text-description tb-text-center">1</div>
          <div class="tb-card tb-text-description tb-text-center">2</div>
          <div class="tb-card tb-text-description tb-text-center">3</div>
          <div class="tb-card tb-text-description tb-text-center">4</div>
          <div class="tb-card tb-text-description tb-text-center">5</div>
          <div class="tb-card tb-text-description tb-text-center">6</div>
          <div class="tb-card tb-text-description tb-text-center">7</div>
          <div class="tb-card tb-text-description tb-text-center">8</div>
        </div>
      </div>
    `,
  }),
}
