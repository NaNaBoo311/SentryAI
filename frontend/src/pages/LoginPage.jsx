import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthForm from '../components/AuthForm'
import { Shield } from 'lucide-react'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (email, password) => {
    setLoading(true)
    setError('')
    const { error: err } = await signIn(email, password)
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-sentry-950 flex items-center justify-center p-4">
      {/* Gradient glow background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sentry-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sentry-700/15 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sentry-500 to-sentry-700 flex items-center justify-center mb-4 shadow-lg shadow-sentry-600/30">
            <Shield className="w-7 h-7 text-sentry-50" />
          </div>
          <h1 className="text-2xl font-bold text-sentry-50">
            Welcome to <span className="text-sentry-400">SentryAI</span>
          </h1>
          <p className="text-sentry-500 text-sm mt-1">Sign in to your security dashboard</p>
        </div>

        {/* Form card */}
        <div className="glass-card p-7">
          <AuthForm mode="login" onSubmit={handleLogin} loading={loading} error={error} />
        </div>

        {/* Signup link */}
        <p className="text-center text-sentry-500 text-sm mt-5">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-sentry-400 hover:text-sentry-300 font-medium transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
