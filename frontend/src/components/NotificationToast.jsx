import { useEffect } from 'react'
import { X, ShieldAlert } from 'lucide-react'

export default function NotificationToast({ message, onClose, duration = 5000 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [message, onClose, duration])

  if (!message) return null

  return (
    <div className="fixed top-5 right-5 z-50 animate-slide-in">
      <div className="glass-card flex items-start gap-3 px-4 py-3 min-w-[320px] max-w-md border-l-4 border-red-500 shadow-2xl">
        <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-sentry-50">Person Detected</p>
          <p className="text-xs text-sentry-400 mt-0.5">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-sentry-500 hover:text-sentry-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
