import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthForm from '../components/AuthForm'
import { Shield, CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const { signUp } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignup = async (email, password) => {
    setLoading(true)
    setError('')
    const { error: err } = await signUp(email, password)
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className="min-h-screen bg-sentry-950 flex items-center justify-center p-4">
      {/* Gradient glow background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-sentry-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-sentry-700/15 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sentry-500 to-sentry-700 flex items-center justify-center mb-4 shadow-lg shadow-sentry-600/30">
            <Shield className="w-7 h-7 text-sentry-50" />
          </div>
          <h1 className="text-2xl font-bold text-sentry-50">
            Join <span className="text-sentry-400">SentryAI</span>
          </h1>
          <p className="text-sentry-500 text-sm mt-1">Create your security account</p>
        </div>

        {/* Success state */}
        {success ? (
          <div className="glass-card p-7 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-sentry-50 mb-2">Check your email</h2>
            <p className="text-sentry-400 text-sm mb-5">
              We've sent a verification link to your email. Please click it to activate your account.
            </p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2">
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            {/* Form card */}
            <div className="glass-card p-7">
              <AuthForm mode="signup" onSubmit={handleSignup} loading={loading} error={error} />
            </div>

            {/* Login link */}
            <p className="text-center text-sentry-500 text-sm mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-sentry-400 hover:text-sentry-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
