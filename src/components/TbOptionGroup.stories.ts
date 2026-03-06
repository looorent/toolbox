import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import TbOptionGroup from './TbOptionGroup.vue'

const meta: Meta<typeof TbOptionGroup> = {
  component: TbOptionGroup,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbOptionGroup>

export const Pill: Story = {
  render: () => ({
    components: { TbOptionGroup },
    setup: () => ({ selected: ref('a') }),
    template:
      "<TbOptionGroup v-model=\"selected\" :options=\"[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }, { value: 'c', label: 'Gamma' }]\" />",
  }),
}

export const PillSmall: Story = {
  render: () => ({
    components: { TbOptionGroup },
    setup: () => ({ selected: ref('a') }),
    template:
      "<TbOptionGroup v-model=\"selected\" size=\"sm\" :options=\"[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }, { value: 'c', label: 'Gamma' }, { value: 'd', label: 'Delta' }, { value: 'e', label: 'Epsilon' }]\" />",
  }),
}

export const Segmented: Story = {
  render: () => ({
    components: { TbOptionGroup },
    setup: () => ({ selected: ref('standard') }),
    template:
      "<TbOptionGroup v-model=\"selected\" variant=\"segmented\" label=\"Variant\" :options=\"[{ value: 'standard', label: 'Standard', description: 'RFC 4648 — uses + / and = padding' }, { value: 'url-safe', label: 'URL-safe', description: 'RFC 4648 §5 — uses - _ and no padding' }]\" />",
  }),
}

export const Tab: Story = {
  render: () => ({
    components: { TbOptionGroup },
    setup: () => ({ selected: ref('users') }),
    template:
      "<TbOptionGroup v-model=\"selected\" variant=\"tab\" :options=\"[{ value: 'users', label: 'Users', badge: 12 }, { value: 'groups', label: 'Groups', badge: 3 }, { value: 'api', label: 'API Docs' }]\" />",
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { TbOptionGroup },
    setup: () => ({ selected: ref('a') }),
    template:
      "<TbOptionGroup v-model=\"selected\" :disabled=\"true\" :options=\"[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }, { value: 'c', label: 'Gamma' }]\" />",
  }),
}
