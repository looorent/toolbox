import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TbFieldInput from './TbFieldInput.vue'

const meta: Meta<typeof TbFieldInput> = {
  component: TbFieldInput,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbFieldInput>

export const Default: Story = {
  args: {
    label: 'Seconds',
    modelValue: '1700000000',
    placeholder: '1700000000',
  },
}

export const WithCopyButton: Story = {
  args: {
    label: 'Hexadecimal (base 16)',
    modelValue: 'FF',
    copyable: true,
  },
}

export const WithError: Story = {
  args: {
    label: 'Seconds',
    modelValue: 'not-a-number',
    error: true,
    errorMessage: 'Invalid input — enter a numeric timestamp.',
  },
}

export const Multiline: Story = {
  args: {
    label: 'Plain Text',
    modelValue: 'Hello, World!',
    placeholder: 'Enter text here…',
    multiline: true,
  },
}

export const MultilineWithError: Story = {
  args: {
    label: 'Encoded',
    modelValue: '%ZZ invalid',
    placeholder: 'Enter encoded text…',
    multiline: true,
    error: true,
    errorMessage: 'Invalid encoded string.',
  },
}
