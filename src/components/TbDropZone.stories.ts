import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TbDropZone from './TbDropZone.vue'

const meta: Meta<typeof TbDropZone> = {
  component: TbDropZone,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbDropZone>

export const Default: Story = {
  args: {
    label: 'Drop a file here or click to browse',
  },
}

export const ImageUpload: Story = {
  args: {
    accept: 'image/*',
    label: 'Drop an image here or click to browse',
    subtitle: 'Supports PNG, JPG, GIF, WebP, and BMP',
  },
}

export const PdfUpload: Story = {
  args: {
    accept: '.pdf',
    label: 'Drop a PDF here or click to browse',
    subtitle: 'Only PDF files are accepted',
  },
}
