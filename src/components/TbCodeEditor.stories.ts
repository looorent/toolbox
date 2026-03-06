import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import TbCodeEditor from './TbCodeEditor.vue'

const meta: Meta<typeof TbCodeEditor> = {
  component: TbCodeEditor,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbCodeEditor>

const sampleJson = `{
  "name": "Ada Lovelace",
  "born": 1815,
  "languages": ["English", "French"],
  "known_for": [
    {
      "title": "First computer program",
      "year": 1843
    }
  ],
  "active": true,
  "spouse": null
}`

export const Default: Story = {
  render: () => ({
    components: { TbCodeEditor },
    setup() {
      const value = ref(sampleJson)
      return { value }
    },
    template: '<TbCodeEditor v-model="value" class="tb-h-80" />',
  }),
}

export const WithPlaceholder: Story = {
  render: () => ({
    components: { TbCodeEditor },
    setup: () => ({ value: ref('') }),
    template: '<TbCodeEditor v-model="value" class="tb-h-80" placeholder="Paste your JSON here..." />',
  }),
}

export const Readonly: Story = {
  render: () => ({
    components: { TbCodeEditor },
    setup: () => ({ value: ref(sampleJson) }),
    template: '<TbCodeEditor v-model="value" class="tb-h-80" :readonly="true" />',
  }),
}
