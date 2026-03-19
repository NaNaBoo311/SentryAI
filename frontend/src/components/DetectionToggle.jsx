import { useState } from 'react'

export default function DetectionToggle({ enabled, onToggle, loading = false }) {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      disabled={loading}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sentry-500/50 ${
        enabled
          ? 'bg-gradient-to-r from-emerald-600 to-emerald-500'
          : 'bg-sentry-700'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
