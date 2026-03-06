import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import TbExpandable from './TbExpandable.vue'

const meta: Meta<typeof TbExpandable> = {
  component: TbExpandable,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TbExpandable>

export const Default: Story = {
  render: () => ({
    components: { TbExpandable },
    setup() {
      const open = ref(false)
      return { open }
    },
    template: `
      <TbExpandable v-model="open">
        <template #header>
          <span class="tb-code-inline tb-text-primary tb-flex-fill">GET /Users</span>
          <span class="tb-hint">List Users</span>
        </template>
        <p class="tb-text-xs tb-text-secondary">Returns a paginated list of users.</p>
      </TbExpandable>
    `,
  }),
}

export const ChevronRight: Story = {
  render: () => ({
    components: { TbExpandable },
    setup() {
      const open = ref(false)
      return { open }
    },
    template: `
      <TbExpandable v-model="open" chevron="right">
        <template #header>
          <span class="tb-text-sm tb-font-medium tb-text-primary tb-flex-fill">Engineering</span>
          <span class="tb-hint">3 members</span>
        </template>
        <div class="tb-row tb-row--gap-3 tb-row--wrap">
          <span class="tb-tag tb-tag--sm">alice.johnson</span>
          <span class="tb-tag tb-tag--sm">bob.smith</span>
          <span class="tb-tag tb-tag--sm">carol.white</span>
        </div>
      </TbExpandable>
    `,
  }),
}

export const Multiple: Story = {
  render: () => ({
    components: { TbExpandable },
    setup() {
      const openIndex = ref<number | null>(null)
      function toggle(index: number) {
        openIndex.value = openIndex.value === index ? null : index
      }
      return { openIndex, toggle }
    },
    template: `
      <div class="tb-stack-2">
        <TbExpandable
          v-for="(item, index) in ['Users', 'Groups', 'Schemas']"
          :key="item"
          :model-value="openIndex === index"
          @update:model-value="toggle(index)"
        >
          <template #header>
            <span class="tb-text-xs tb-font-medium tb-text-primary tb-flex-fill">{{ item }}</span>
          </template>
          <p class="tb-text-xs tb-text-secondary">Content for {{ item }} section.</p>
        </TbExpandable>
      </div>
    `,
  }),
}
