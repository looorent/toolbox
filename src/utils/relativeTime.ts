export function relativeTime(date: Date | number): string {
  const time = typeof date === 'number' ? date * 1000 : date.getTime()
  const diff = time - Date.now()
  const absoluteDiff = Math.abs(diff)
  const isPast = diff < 0

  if (absoluteDiff < 60_000) {
    return isPast ? 'just now' : 'in less than a minute'
  }

  if (absoluteDiff < 3_600_000) {
    const minutes = Math.floor(absoluteDiff / 60_000)
    return isPast ? `${minutes}m ago` : `in ${minutes}m`
  }

  if (absoluteDiff < 86_400_000) {
    const hours = Math.floor(absoluteDiff / 3_600_000)
    return isPast ? `${hours}h ago` : `in ${hours}h`
  }

  const days = Math.floor(absoluteDiff / 86_400_000)
  return isPast ? `${days}d ago` : `in ${days}d`
}
