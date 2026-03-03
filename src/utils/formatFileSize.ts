export function formatFileSize(bytes: number): string {
  switch (true) {
    case bytes < 1024:
      return `${bytes} B`
    case bytes < 1024 * 1024:
      return `${(bytes / 1024).toFixed(1)} KB`
    default:
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
}
