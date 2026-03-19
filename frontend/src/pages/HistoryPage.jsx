import { useEffect, useState } from 'react'
import { History, RefreshCw } from 'lucide-react'
import HistoryTable from '../components/HistoryTable'
import { detectionService } from '../services/detectionService'

export default function HistoryPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 25

  useEffect(() => {
    loadHistory()
  }, [page])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const data = await detectionService.getDetectionHistory(PAGE_SIZE, page * PAGE_SIZE)
      setEvents(data || [])
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <History className="w-7 h-7 text-sentry-400" />
            Detection History
          </h1>
          <p className="page-subtitle">View all past human detection events</p>
        </div>
        <button onClick={loadHistory} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <HistoryTable events={events} loading={loading} />

      {/* Pagination */}
      {events.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn-secondary text-sm disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-sm text-sentry-500">Page {page + 1}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={events.length < PAGE_SIZE}
            className="btn-secondary text-sm disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
