import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState(false)

  // Check if user has a valid session from reset link
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Invalid or expired reset link. Please request a new one.')
      }
    }
    checkSession()
  }, [])

  const validateForm = () => {
    const errors = {}

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setPassword('')
      setConfirmPassword('')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (error && error.includes('Invalid or expired')) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar user={null} />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Reset link expired
            </h1>
          </div>

          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg mb-6">
            <p className="text-sm">{error}</p>
          </div>

          <div className="space-y-4">
            <Link
              href="/forgot-password"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
            >
              Request new reset link
            </Link>

            <p className="text-center text-sm text-gray-600">
              <Link
                href="/login"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Back to login
              </Link>
            </p>
          </div>
        </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={null} />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create new password
          </h1>
          <p className="text-gray-600 mt-2">
            Enter your new password below
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg">
              <p className="text-sm font-medium">Password reset successfully!</p>
              <p className="text-sm mt-1">Redirecting to login...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Reset Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              )}
              Reset Password
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
    </div>
  )
}
