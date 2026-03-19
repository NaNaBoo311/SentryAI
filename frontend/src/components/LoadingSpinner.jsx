export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`${sizeClasses[size]} border-2 border-sentry-700 border-t-sentry-400 rounded-full animate-spin`}
      />
      {text && <p className="text-sentry-400 text-sm">{text}</p>}
    </div>
  )
}
