import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/lib/ToastContext'
import Navbar from '@/components/Navbar'
import SavingsSummary from '@/components/Dashboard/SavingsSummary'
import SavingsChart from '@/components/Dashboard/SavingsChart'
import AuditHistory from '@/components/Dashboard/AuditHistory'
import DashboardSkeleton from '@/components/Dashboard/DashboardSkeleton'

export default function Dashboard({ user: initialUser, audits: initialAudits = [], profile: initialProfile }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [user, setUser] = useState(initialUser)
  const [audits, setAudits] = useState(initialAudits)
  const [profile, setProfile] = useState(initialProfile)
  const [loading, setLoading] = useState(!initialUser)

  // Check auth on mount (client-side fallback)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        
        if (!currentUser) {
          router.push('/login')
          return
        }
        
        setUser(currentUser)
        
        // Fetch audits and profile if not already loaded
        if (!initialUser) {
          const [auditsRes, profileRes] = await Promise.all([
            supabase
              .from('audits')
              .select('*')
              .eq('user_id', currentUser.id)
              .order('created_at', { ascending: false }),
            supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single(),
          ])
          
          setAudits(auditsRes.data || [])
          setProfile(profileRes.data)
        }
      } catch (err) {
        console.error('Auth check error:', err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    if (!initialUser) {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [initialUser, router])

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

  if (loading) {
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {getGreeting()}, {getFirstName()}! 👋
            </h1>
            <p className="text-gray-600">{getTodayDate()}</p>
          </div>
          <Link
            href="/audit/new"
            className="mt-4 md:mt-0 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors inline-block"
          >
            Run New Audit
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Quick Tips</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 text-xl">📅</span>
                  <p className="text-sm text-gray-700">
                    Run audits monthly to track spending changes over time
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 text-xl">🔗</span>
                  <p className="text-sm text-gray-700">
                    Share your audit URL to get team feedback on recommendations
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 text-xl">⚡</span>
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

