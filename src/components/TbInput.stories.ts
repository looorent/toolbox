import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import TbInput from './TbInput.vue'

const meta: Meta<typeof TbInput> = {
  component: TbInput,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbInput>

export const Default: Story = {
  render: () => ({
    components: { TbInput },
    setup: () => ({ value: ref('') }),
    template: '<TbInput v-model="value" placeholder="Enter a value..." />',
  }),
}

export const WithError: Story = {
  render: () => ({
    components: { TbInput },
    setup: () => ({ value: ref('bad-input') }),
    template: '<TbInput v-model="value" placeholder="Invalid input" :error="true" />',
  }),
}

export const NumberInput: Story = {
  render: () => ({
    components: { TbInput },
    setup: () => ({ value: ref(5) }),
    template: '<TbInput v-model="value" type="number" :min="1" :max="100" class="tb-input--small" />',
  }),
}
