export function generateUuid(): string {
  return crypto.randomUUID()
}

export function generateUuids(count: number): string[] {
  return Array.from({ length: Math.max(1, count) }, generateUuid)
}
