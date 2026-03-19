import { formatDateTime, formatConfidence } from '../utils/helpers'
import EmptyState from './EmptyState'

export default function HistoryTable({ events = [], loading = false }) {
  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-sentry-800/40 rounded-lg mb-2" />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon="shield"
        title="No detection events yet"
        description="Events will appear here when a person is detected by your cameras."
      />
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-sentry-700/40">
              <th className="text-left text-xs font-semibold text-sentry-400 uppercase tracking-wider px-5 py-3.5">
                Time
              </th>
              <th className="text-left text-xs font-semibold text-sentry-400 uppercase tracking-wider px-5 py-3.5">
                Camera
              </th>
              <th className="text-left text-xs font-semibold text-sentry-400 uppercase tracking-wider px-5 py-3.5">
                Confidence
              </th>
              <th className="text-left text-xs font-semibold text-sentry-400 uppercase tracking-wider px-5 py-3.5">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                key={event.id}
                className="border-b border-sentry-800/40 hover:bg-sentry-800/30 transition-colors"
              >
                <td className="px-5 py-3.5 text-sm text-sentry-300">
                  {formatDateTime(event.created_at)}
                </td>
                <td className="px-5 py-3.5 text-sm text-sentry-200 font-medium">
                  {event.camera_name || 'Unknown'}
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        event.confidence >= 0.8
                          ? 'bg-red-400'
                          : event.confidence >= 0.5
                          ? 'bg-amber-400'
                          : 'bg-sentry-400'
                      }`}
                    />
                    <span className="text-sm text-sentry-200">
                      {formatConfidence(event.confidence)}
                    </span>
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="status-alert text-[11px]">{event.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
