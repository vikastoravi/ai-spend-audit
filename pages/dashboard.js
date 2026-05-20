import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/lib/ToastContext'
import { useSupabaseAuth } from '@/lib/useSupabaseAuth'
import Navbar from '@/components/Navbar'
import SavingsSummary from '@/components/Dashboard/SavingsSummary'
import SavingsChart from '@/components/Dashboard/SavingsChart'
import AuditHistory from '@/components/Dashboard/AuditHistory'
import DashboardSkeleton from '@/components/Dashboard/DashboardSkeleton'

export default function Dashboard({ audits: initialAudits = [], profile: initialProfile }) {
  const router = useRouter()
  const { showToast } = useToast()
  const { user, isLoading: authLoading } = useSupabaseAuth()
  const [audits, setAudits] = useState(initialAudits)
  const [profile, setProfile] = useState(initialProfile)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)

        const [auditsRes, profileRes] = await Promise.all([
          supabase
            .from('audits')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single(),
        ])

        setAudits(auditsRes.data || [])
        setProfile(profileRes.data)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [authLoading, router, user])

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Get user's first name
  const getFirstName = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0]
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0]
    }
    return user?.email?.split('@')[0] || 'User'
  }

  // Get today's date
  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Handle delete audit
  const handleDeleteAudit = async (auditId) => {
    try {
      const response = await fetch('/api/delete-audit', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId, userId: user?.id }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        const message = data?.error || 'Failed to delete audit'
        throw new Error(message)
      }

      // Optimistically remove from state
      setAudits(audits.filter(a => a.id !== auditId))

      // Show toast notification
      showToast('Audit deleted successfully', 'success')
    } catch (err) {
      console.error('Delete error:', err)
      showToast(err.message || 'Error deleting audit', 'error')
    }
  }

  if (authLoading || loading) {
    return <DashboardSkeleton />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-2">
              {getGreeting()}, {getFirstName()}! 👋
            </h1>
            <p className="text-gray-600 md:text-lg">{getTodayDate()}</p>
          </div>
          <Link
            href="/audit/new"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl transform transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-green-200"
          >
            📈 Run New Audit
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Savings Summary */}
            <section>
              <SavingsSummary audits={audits} />
            </section>

            {/* Savings Chart */}
            <section>
              <SavingsChart audits={audits} />
            </section>

            {/* Audit History */}
            <section>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Your Audit History</h2>
              </div>
              <AuditHistory audits={audits} onDelete={handleDeleteAudit} />
            </section>
          </div>

          {/* Sidebar - Quick Tips */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-20 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Quick Tips</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="shrink-0 text-xl">📅</span>
                  <p className="text-sm text-gray-700">
                    Run audits monthly to track spending changes over time
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 text-xl">🔗</span>
                  <p className="text-sm text-gray-700">
                    Share your audit link with stakeholders for feedback
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 text-xl">⚡</span>
                  <p className="text-sm text-gray-700">
                    Implement recommendations and re-run to measure real savings
                  </p>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export async function getServerSideProps(context) {
  try {
    // Try to get user session from request cookies
    // For now, we'll let the client-side auth handle it
    // This prevents the redirect to login on the server
    return {
      props: {
        user: null,
        audits: [],
        profile: null,
      },
    }
  } catch (err) {
    console.error('Dashboard error:', err)
    return {
      props: {
        user: null,
        audits: [],
        profile: null,
      },
    }
  }
}

