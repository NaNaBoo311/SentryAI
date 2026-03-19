import { useEffect, useState } from 'react'
import { Bell, CheckCheck, Eye } from 'lucide-react'
import { notificationService } from '../services/notificationService'
import { timeAgo } from '../utils/helpers'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = await notificationService.getMyNotifications(100, 0)
      setNotifications(data || [])
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (err) {
      console.error('Failed to mark read:', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (err) {
      console.error('Failed to mark all read:', err)
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Bell className="w-7 h-7 text-sentry-400" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2.5 py-0.5 bg-red-500/20 text-red-400 text-sm font-semibold rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="page-subtitle">Security alerts and detection notifications</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck className="w-4 h-4" />
            Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="inbox"
          title="No notifications"
          description="You'll receive alerts when a person is detected by your cameras."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`glass-card px-5 py-4 flex items-start gap-4 transition-all ${
                !notif.is_read ? 'border-l-4 border-l-sentry-500' : 'opacity-70'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  !notif.is_read
                    ? 'bg-red-500/20 border border-red-500/30'
                    : 'bg-sentry-800/40'
                }`}
              >
                <Bell
                  className={`w-4 h-4 ${!notif.is_read ? 'text-red-400' : 'text-sentry-600'}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-sentry-50">{notif.title}</p>
                  <span className="text-xs text-sentry-500 flex-shrink-0">
                    {timeAgo(notif.created_at)}
                  </span>
                </div>
                <p className="text-sm text-sentry-400 mt-0.5">{notif.message}</p>
              </div>
              {!notif.is_read && (
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  className="p-1.5 rounded-lg hover:bg-sentry-800/40 text-sentry-500 hover:text-sentry-300 transition-colors flex-shrink-0"
                  title="Mark as read"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
