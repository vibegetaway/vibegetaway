// Helper to format duration from minutes to "Xh Ym" format
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

// Helper to format date/time from ISO string
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  const hours = date.getHours().toString().padStart(2, '0')
  const mins = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${mins}`
}

// Helper to format date from ISO string (e.g., "Mon, Dec 10")
export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}
