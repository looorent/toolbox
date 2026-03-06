import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TbEmptyState from './TbEmptyState.vue'

const meta: Meta<typeof TbEmptyState> = {
  component: TbEmptyState,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbEmptyState>

export const Default: Story = {
  args: {
    title: 'No items yet',
  },
}

export const WithDescription: Story = {
  args: {
    title: 'Waiting for requests…',
    description: 'Send a request to the webhook URL above to see it appear here.',
  },
}

export const WithIcon: Story = {
  render: () => ({
    components: { TbEmptyState },
    template: `
      <TbEmptyState title="Select a request to inspect it">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="tb-icon-lg tb-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </template>
      </TbEmptyState>
    `,
  }),
}

export const FullPage: Story = {
  render: () => ({
    components: { TbEmptyState },
    template: `
      <TbEmptyState
        full
        title="Webhook Catcher"
        description="Generate a unique URL and inspect every HTTP request sent to it in real time."
      >
        <button class="tb-btn-primary">Create New Webhook</button>
      </TbEmptyState>
    `,
  }),
}

export const FullPageWithError: Story = {
  render: () => ({
    components: { TbEmptyState },
    template: `
      <TbEmptyState
        full
        title="Tool Name"
        description="Description of the tool."
        error="Failed to load server."
      >
        <button class="tb-btn-primary">Create</button>
      </TbEmptyState>
    `,
  }),
}
