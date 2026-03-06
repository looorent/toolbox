import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import TbCheckbox from './TbCheckbox.vue'

const meta: Meta<typeof TbCheckbox> = {
  component: TbCheckbox,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbCheckbox>

export const Default: Story = {
  render: () => ({
    components: { TbCheckbox },
    setup() {
      const checked = ref(false)
      return { checked }
    },
    template: '<TbCheckbox v-model="checked" label="Show grid" />',
  }),
}

export const Checked: Story = {
  render: () => ({
    components: { TbCheckbox },
    setup() {
      const checked = ref(true)
      return { checked }
    },
    template: '<TbCheckbox v-model="checked" label="Enabled" />',
  }),
}
