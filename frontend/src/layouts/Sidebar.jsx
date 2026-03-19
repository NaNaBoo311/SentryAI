import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  History,
  Bell,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/history', label: 'History', icon: History },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col bg-sentry-950/80 backdrop-blur-xl border-r border-sentry-800/50 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sentry-800/50">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sentry-500 to-sentry-700 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-sentry-50" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-sentry-50 tracking-tight">
            Sentry<span className="text-sentry-400">AI</span>
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-sentry-600/20 text-sentry-300 border border-sentry-600/30'
                  : 'text-sentry-500 hover:text-sentry-300 hover:bg-sentry-800/40'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-sentry-400' : ''}`} />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-sentry-800/50 text-sentry-600 hover:text-sentry-400 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  )
}
