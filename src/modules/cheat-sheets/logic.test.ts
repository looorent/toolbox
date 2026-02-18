import { describe, expect, it } from 'vitest'
import { filterSheetEntries, sheets } from './logic'

describe('sheets', () => {
  it('contains at least one sheet', () => {
    expect(sheets.length).toBeGreaterThan(0)
  })

  it('each sheet has a key, label, and categories', () => {
    for (const sheet of sheets) {
      expect(sheet.key).toBeTruthy()
      expect(sheet.label).toBeTruthy()
      expect(sheet.categories.length).toBeGreaterThan(0)
    }
  })

  it('each category has entries', () => {
    for (const sheet of sheets) {
      for (const category of sheet.categories) {
        expect(category.category).toBeTruthy()
        expect(category.entries.length).toBeGreaterThan(0)
      }
    }
  })

  it('each entry has a command and description', () => {
    for (const sheet of sheets) {
      for (const category of sheet.categories) {
        for (const entry of category.entries) {
          expect(entry.command).toBeTruthy()
          expect(entry.description).toBeTruthy()
        }
      }
    }
  })

  it('has unique sheet keys', () => {
    const keys = sheets.map(sheet => sheet.key)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('filterSheetEntries', () => {
  const testSheet = sheets[0]

  it('returns all categories when query is empty', () => {
    expect(filterSheetEntries(testSheet, '')).toEqual(testSheet.categories)
  })

  it('returns all categories when query is whitespace', () => {
    expect(filterSheetEntries(testSheet, '   ')).toEqual(testSheet.categories)
  })

  it('filters entries by command match', () => {
    const firstEntry = testSheet.categories[0]?.entries[0]
    if (!firstEntry) {
      return
    }
    const searchTerm = firstEntry.command.slice(0, 5)
    const results = filterSheetEntries(testSheet, searchTerm)
    const allEntries = results.flatMap(category => category.entries)
    expect(allEntries.some(entry => entry.command.includes(searchTerm))).toBe(true)
  })

  it('filters entries by description match', () => {
    const firstEntry = testSheet.categories[0]?.entries[0]
    if (!firstEntry) {
      return
    }
    const searchTerm = firstEntry.description.split(' ')[0] ?? ''
    const results = filterSheetEntries(testSheet, searchTerm)
    expect(results.length).toBeGreaterThan(0)
  })

  it('is case-insensitive', () => {
    const firstEntry = testSheet.categories[0]?.entries[0]
    if (!firstEntry) {
      return
    }
    const lowerResults = filterSheetEntries(testSheet, firstEntry.command.toLowerCase())
    const upperResults = filterSheetEntries(testSheet, firstEntry.command.toUpperCase())
    expect(lowerResults.length).toBe(upperResults.length)
  })

  it('returns empty array when nothing matches', () => {
    expect(filterSheetEntries(testSheet, 'zzzznonexistentzzzz')).toEqual([])
  })

  it('excludes categories with no matching entries', () => {
    const results = filterSheetEntries(testSheet, 'zzzznonexistentzzzz')
    expect(results.every(category => category.entries.length > 0)).toBe(true)
  })

  it('preserves category names in results', () => {
    const firstEntry = testSheet.categories[0]?.entries[0]
    if (!firstEntry) {
      return
    }
    const results = filterSheetEntries(testSheet, firstEntry.command)
    for (const category of results) {
      expect(category.category).toBeTruthy()
    }
  })
})
