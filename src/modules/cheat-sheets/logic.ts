import { bashSheet } from './data/bash'
import { cssSelectorsSheet } from './data/css-selectors'
import { gitSheet } from './data/git'
import { httpStatusSheet } from './data/http-status'
import { regexSheet } from './data/regex'
import type { CheatSheet, CheatSheetCategory } from './types'

export const sheets: [CheatSheet, ...CheatSheet[]] = [gitSheet, httpStatusSheet, bashSheet, regexSheet, cssSelectorsSheet]

export function filterSheetEntries(sheet: CheatSheet, query: string): CheatSheetCategory[] {
  const trimmedQuery = query.trim().toLowerCase()
  if (!trimmedQuery) {
    return sheet.categories
  }

  return sheet.categories
    .map(category => ({
      category: category.category,
      entries: category.entries.filter(
        entry => entry.command.toLowerCase().includes(trimmedQuery) || entry.description.toLowerCase().includes(trimmedQuery),
      ),
    }))
    .filter(category => category.entries.length > 0)
}
