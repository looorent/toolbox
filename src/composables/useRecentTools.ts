import { allTools } from '@modules/sidebar/logic'
import type { Tool } from '@modules/sidebar/types'
import { computed, ref } from 'vue'

const STORAGE_KEY = 'toolbox:recent-tools'
const MAX_RECENT = 5

function readFromStorage(): string[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === null) {
    return []
  }
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : []
  } catch {
    return []
  }
}

const recentPaths = ref<string[]>(readFromStorage())

export function useRecentTools() {
  const recentTools = computed<Tool[]>(() =>
    recentPaths.value.map(path => allTools.find(tool => tool.path === path) ?? null).filter((tool): tool is Tool => tool !== null),
  )

  function addRecentTool(path: string): void {
    const updated = [path, ...recentPaths.value.filter(p => p !== path)].slice(0, MAX_RECENT)
    recentPaths.value = updated
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  return { recentTools, addRecentTool }
}
