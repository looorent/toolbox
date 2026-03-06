import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import TbSlider from './TbSlider.vue'

const meta: Meta<typeof TbSlider> = {
  component: TbSlider,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbSlider>

export const Default: Story = {
  render: () => ({
    components: { TbSlider },
    setup() {
      const value = ref(50)
      return { value }
    },
    template: '<TbSlider v-model="value" label="Threshold" :min="0" :max="100" />',
  }),
}

export const WithDescription: Story = {
  render: () => ({
    components: { TbSlider },
    setup() {
      const value = ref(4)
      return { value }
    },
    template: '<TbSlider v-model="value" label="Color Precision" description="Higher values produce more colors" :min="1" :max="8" />',
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { TbSlider },
    setup: () => ({ value: ref(30) }),
    template: '<TbSlider v-model="value" label="Locked Setting" :min="0" :max="100" :disabled="true" />',
  }),
}
