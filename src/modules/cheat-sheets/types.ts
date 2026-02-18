export interface CheatSheetEntry {
  command: string
  description: string
}

export interface CheatSheetCategory {
  category: string
  entries: CheatSheetEntry[]
}

export interface CheatSheet {
  label: string
  key: string
  categories: CheatSheetCategory[]
}
