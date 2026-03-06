import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import TbSelect from './TbSelect.vue'

const meta: Meta<typeof TbSelect> = {
  component: TbSelect,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbSelect>

export const Default: Story = {
  render: () => ({
    components: { TbSelect },
    setup() {
      const value = ref('json')
      return { value }
    },
    template: `
      <TbSelect v-model="value">
        <option value="json">JSON</option>
        <option value="yaml">YAML</option>
        <option value="xml">XML</option>
      </TbSelect>
    `,
  }),
}

export const Small: Story = {
  render: () => ({
    components: { TbSelect },
    setup() {
      const value = ref('utf8')
      return { value }
    },
    template: `
      <TbSelect v-model="value" size="sm">
        <option value="utf8">UTF-8</option>
        <option value="ascii">ASCII</option>
        <option value="base64">Base64</option>
      </TbSelect>
    `,
  }),
}

export const ErrorState: Story = {
  render: () => ({
    components: { TbSelect },
    setup() {
      const value = ref('')
      return { value }
    },
    template: `
      <TbSelect v-model="value" :error="true">
        <option value="" disabled>Select a format…</option>
        <option value="json">JSON</option>
        <option value="yaml">YAML</option>
      </TbSelect>
    `,
  }),
}

export const WithLabel: Story = {
  render: () => ({
    components: { TbSelect },
    setup() {
      const value = ref('4')
      return { value }
    },
    template: `
      <div>
        <label class="tb-label">Indent size</label>
        <TbSelect v-model="value">
          <option value="2">2 spaces</option>
          <option value="4">4 spaces</option>
          <option value="tab">Tab</option>
        </TbSelect>
      </div>
    `,
  }),
}
