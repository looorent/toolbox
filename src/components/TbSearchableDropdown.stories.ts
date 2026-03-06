import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import TbSearchableDropdown from './TbSearchableDropdown.vue'

const meta: Meta<typeof TbSearchableDropdown> = {
  component: TbSearchableDropdown,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbSearchableDropdown>

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
]

export const Default: Story = {
  render: () => ({
    components: { TbSearchableDropdown },
    setup: () => ({ value: ref('America/New_York'), options: timezones }),
    template: '<TbSearchableDropdown v-model="value" :options="options" placeholder="Search timezones..." />',
  }),
}

export const FewOptions: Story = {
  render: () => ({
    components: { TbSearchableDropdown },
    setup: () => ({ value: ref('utf-8'), options: ['utf-8', 'ascii', 'iso-8859-1'] }),
    template: '<TbSearchableDropdown v-model="value" :options="options" placeholder="Select encoding..." />',
  }),
}

export const CustomPlaceholder: Story = {
  render: () => ({
    components: { TbSearchableDropdown },
    setup: () => ({ value: ref('Europe/London'), options: timezones }),
    template: '<TbSearchableDropdown v-model="value" :options="options" placeholder="Type to filter..." />',
  }),
}
