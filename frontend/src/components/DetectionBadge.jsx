export default function DetectionBadge({ count = 0 }) {
  if (count === 0) return null

  return (
    <span className="status-alert animate-pulse">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
      {count} detected
    </span>
  )
}
