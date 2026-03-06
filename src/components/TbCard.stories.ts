import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TbCard from './TbCard.vue'

const meta: Meta<typeof TbCard> = {
  component: TbCard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbCard>

export const Default: Story = {
  render: () => ({
    components: { TbCard },
    template: '<TbCard><p class="tb-text-description">Card content goes here</p></TbCard>',
  }),
}

export const Clickable: Story = {
  render: () => ({
    components: { TbCard },
    template: '<TbCard :clickable="true"><p class="tb-text-description">Click me</p></TbCard>',
  }),
}

export const WithTitle: Story = {
  render: () => ({
    components: { TbCard },
    template:
      '<TbCard title="Fingerprints" class="tb-stack-3"><p class="tb-text-description">Card content with a section title</p></TbCard>',
  }),
}

export const Sectioned: Story = {
  render: () => ({
    components: { TbCard },
    template: `
      <TbCard sectioned title="Header">
        <p class="tb-text-description">Body content with header/body split</p>
      </TbCard>
    `,
  }),
}

export const SectionedWithActions: Story = {
  render: () => ({
    components: { TbCard },
    template: `
      <TbCard sectioned title="Claims">
        <template #actions>
          <div class="tb-row tb-row--gap-1">
            <button class="tb-btn-mini tb-btn-mini--active">Table</button>
            <button class="tb-btn-mini">JSON</button>
          </div>
        </template>
        <p class="tb-text-description">Content area with action buttons in header</p>
      </TbCard>
    `,
  }),
}
