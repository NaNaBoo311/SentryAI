import { ShieldOff, Inbox, Camera } from 'lucide-react'

const icons = {
  shield: ShieldOff,
  inbox: Inbox,
  camera: Camera,
}

export default function EmptyState({
  icon = 'inbox',
  title = 'Nothing here yet',
  description = '',
}) {
  const Icon = icons[icon] || Inbox

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-sentry-800/60 border border-sentry-700/30 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-sentry-500" />
      </div>
      <h3 className="text-lg font-semibold text-sentry-300 mb-1">{title}</h3>
      {description && (
        <p className="text-sentry-500 text-sm text-center max-w-sm">{description}</p>
      )}
    </div>
  )
}
