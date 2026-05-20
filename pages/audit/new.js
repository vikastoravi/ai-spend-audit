import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useSupabaseAuth } from '@/lib/useSupabaseAuth'
import Navbar from '@/components/Navbar'
import SpendForm from '@/components/SpendForm'

export default function NewAuditPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useSupabaseAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, router, user])

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Checking session...</p>
        </div>
      </div>
    )
  }

  const handleAuditSubmit = async (formData) => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Persist the input so the results page (or client) can read it
      try {
        localStorage.setItem('audit-result-input', JSON.stringify(formData))
      } catch (e) {
        // ignore localStorage errors (e.g., SSR or private mode)
        console.warn('Could not persist audit input to localStorage', e)
      }

      // Call the create audit API
      const response = await fetch('/api/create-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamSize: formData.teamSize,
          useCase: formData.useCase,
          tools: formData.tools,
          user_id: user.id,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create audit')
      }

      const result = await response.json()

      // Save the new audit id so the results page can reference it if needed,
      // but keep users on the consistent results page flow.
      if (result.audit_id) {
        try {
          localStorage.setItem('latest-audit-id', result.audit_id)
        } catch (e) {
          console.warn('Could not persist latest audit ID', e)
        }
        router.replace('/results')
        return
      }
      throw new Error('No audit ID returned')
    } catch (err) {
      console.error('Audit submission error:', err)
      setError(err.message || 'Failed to run audit. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50">
      <Navbar user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 rounded-full bg-linear-to-r from-emerald-100 via-lime-100 to-teal-100 px-5 py-3 mb-4 text-sm font-semibold text-emerald-700 shadow-sm">
            <span className="text-lg">✨</span>
            Designed for fast decisions and visible savings
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
            Run your most impactful AI spend audit yet
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Share the tools your team relies on, and we’ll generate a clear recommendations report that highlights savings and efficiency gains.
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
          {/* Error message */}
          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Form */}
          <SpendForm 
            onSubmit={handleAuditSubmit}
            isLoading={loading}
          />

          {/* Loading state */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 text-center max-w-sm">
                <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-900 font-medium mb-2">Analyzing your spending...</p>
                <p className="text-gray-600 text-sm">This may take a moment</p>
              </div>
            </div>
          )}
        </div>

        {/* Info cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Detailed Analysis</h3>
            <p className="text-gray-600 text-sm">Get a breakdown of your spending per tool and team member</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Savings Found</h3>
            <p className="text-gray-600 text-sm">Discover ways to reduce costs without sacrificing productivity</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Actionable Tips</h3>
            <p className="text-gray-600 text-sm">Get personalized recommendations to optimize your AI stack</p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Not ready? <Link href="/dashboard" className="text-green-600 hover:text-green-700 font-medium">
              Go back to dashboard
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
