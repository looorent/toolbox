import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { defineComponent } from 'vue'

const Placeholder = defineComponent({ template: '<div />' })

const meta: Meta<typeof Placeholder> = {
  title: 'Layout/Composition',
  component: Placeholder,
  tags: ['autodocs', '!dev'],
}

export default meta
type Story = StoryObj<typeof Placeholder>

export const CardsInGrid: Story = {
  render: () => ({
    template: `
      <div>
        <p class="tb-hint tb-mb-4">.tb-grid-2 > .tb-card</p>
        <div class="tb-grid-2">
          <div class="tb-card">
            <span class="tb-label">Label</span>
            <p class="tb-text-sm tb-font-mono tb-text-primary">Value content</p>
          </div>
          <div class="tb-card">
            <span class="tb-label">Label</span>
            <p class="tb-text-sm tb-font-mono tb-text-primary">Value content</p>
          </div>
        </div>
      </div>
    `,
  }),
}

export const StackInsideCard: Story = {
  render: () => ({
    template: `
      <div>
        <p class="tb-hint tb-mb-4">.tb-card > .tb-stack-3</p>
        <div class="tb-card">
          <div class="tb-stack-3">
            <div>
              <span class="tb-label">First Name</span>
              <input class="tb-input" value="Jane" readonly />
            </div>
            <div>
              <span class="tb-label">Last Name</span>
              <input class="tb-input" value="Doe" readonly />
            </div>
            <div>
              <span class="tb-label">Email</span>
              <input class="tb-input" value="jane@example.com" readonly />
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

export const AlertsInStack: Story = {
  render: () => ({
    template: `
      <div>
        <p class="tb-hint tb-mb-4">.tb-stack-3 with alerts</p>
        <div class="tb-stack-3">
          <div class="tb-alert tb-alert--success">Operation completed successfully.</div>
          <div class="tb-alert tb-alert--warning">This certificate expires in 30 days.</div>
          <div class="tb-alert tb-alert--error">Invalid token format.</div>
          <div class="tb-alert tb-alert--info">Paste a value above to get started.</div>
        </div>
      </div>
    `,
  }),
}

export const StatCardsInGrid: Story = {
  render: () => ({
    template: `
      <div>
        <p class="tb-hint tb-mb-4">.tb-grid-3 > .tb-stat-card</p>
        <div class="tb-grid-3">
          <div class="tb-stat-card">
            <div class="tb-stat-card__title">Seconds</div>
            <div class="tb-stat-card__value">1709251200</div>
          </div>
          <div class="tb-stat-card">
            <div class="tb-stat-card__title">Milliseconds</div>
            <div class="tb-stat-card__value">1709251200000</div>
          </div>
          <div class="tb-stat-card">
            <div class="tb-stat-card__title">ISO 8601</div>
            <div class="tb-stat-card__value">2024-03-01T00:00:00Z</div>
          </div>
        </div>
      </div>
    `,
  }),
}
