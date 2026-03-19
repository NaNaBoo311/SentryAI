/**
 * Format a timestamp to a readable date-time string.
 */
export function formatDateTime(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * Format a timestamp to a relative "time ago" string.
 */
export function timeAgo(dateString) {
  if (!dateString) return ''
  const now = new Date()
  const then = new Date(dateString)
  const seconds = Math.floor((now - then) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return formatDateTime(dateString)
}

/**
 * Format confidence as a percentage string.
 */
export function formatConfidence(confidence) {
  if (confidence == null) return '—'
  return `${Math.round(confidence * 100)}%`
}
