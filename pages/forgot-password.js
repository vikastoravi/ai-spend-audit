import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      // Always show success message for security
      // (don't reveal if email exists or not)
      setSuccess(true)
      setCountdown(60)
      setEmail('')

      if (error) {
        console.error('Reset password error:', error)
      }
    } catch (err) {
      console.error('Error in resetPasswordForEmail:', err)
      // Still show success message for security
      setSuccess(true)
      setCountdown(60)
      setEmail('')
    } finally {
      setLoading(false)
    }
  }

  const canResend = countdown === 0 && !loading

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={null} />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Reset your password
          </h1>
          <p className="text-gray-600 mt-2">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg">
              <p className="text-sm">
                If an account exists for this email, you'll receive a password
                reset link shortly.
              </p>
            </div>

            {/* Resend Message */}
            {countdown > 0 && (
              <p className="text-center text-sm text-gray-600">
                You can request another reset link in{' '}
                <span className="font-medium text-gray-900">{countdown}s</span>
              </p>
            )}

            {/* Resend Form */}
            {countdown === 0 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading && (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  )}
                  Send Another Reset Link
                </button>
              </form>
            )}

            {/* Back to Login */}
            <p className="text-center text-sm">
              <Link
                href="/login"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Back to login
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || !canResend}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              )}
              Send Reset Link
            </button>

            {/* Back to Login */}
            <p className="text-center text-sm text-gray-600">
              <Link
                href="/login"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Back to login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
