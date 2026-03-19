import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { notificationService } from '../services/notificationService'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 15000)
    return () => clearInterval(interval)
  }, [])

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount()
      setUnreadCount(count || 0)
    } catch {
      // silently fail
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-sentry-950/60 backdrop-blur-xl border-b border-sentry-800/50">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: page context */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-sentry-500 uppercase tracking-widest">
            System Online
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3">
          {/* Notifications bell */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-xl hover:bg-sentry-800/40 text-sentry-400 hover:text-sentry-200 transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User menu */}
          <div className="flex items-center gap-2 pl-3 border-l border-sentry-800/50">
            <div className="w-8 h-8 rounded-lg bg-sentry-700/60 flex items-center justify-center">
              <User className="w-4 h-4 text-sentry-400" />
            </div>
            <span className="text-sm text-sentry-300 hidden sm:block max-w-[150px] truncate">
              {user?.email || 'User'}
            </span>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl hover:bg-red-500/10 text-sentry-500 hover:text-red-400 transition-all"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
