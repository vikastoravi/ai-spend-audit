import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/lib/ToastContext'
import Navbar from '@/components/Navbar'

export default function SettingsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      const saved = window.localStorage.getItem('spendAuditSettings')
      const parsed = saved ? JSON.parse(saved) : {}
      return parsed.emailNotifications ?? true
    } catch (err) {
      console.error('Failed to load settings:', err)
      return true
    }
  })
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    try {
      const saved = window.localStorage.getItem('spendAuditSettings')
      const parsed = saved ? JSON.parse(saved) : {}
      return parsed.themeMode || 'light'
    } catch (err) {
      console.error('Failed to load settings:', err)
      return 'light'
    }
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) {
          router.push('/login')
          return
        }
        setUser(currentUser)
      } catch (err) {
        console.error('Auth error:', err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSave = () => {
    setSaving(true)
    try {
      window.localStorage.setItem(
        'spendAuditSettings',
        JSON.stringify({ emailNotifications, themeMode })
      )
      showToast('Settings saved successfully', 'success')
    } catch (err) {
      console.error('Save error:', err)
      showToast('Unable to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-gray-200">
          <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account settings…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <Navbar user={user} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-600 font-semibold mb-2">Profile settings</p>
            <h1 className="text-4xl font-bold text-gray-900">Your account preferences</h1>
            <p className="mt-3 text-gray-600 max-w-2xl">
              Manage your profile defaults, notification preferences, and saved experience for SpendAudit.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-gray-200 bg-white text-gray-800 shadow-sm hover:shadow-md transition"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <section className="rounded-[2rem] bg-white border border-gray-200 p-8 shadow-xl">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Preferences</h2>
              <p className="text-gray-600">These settings are saved locally for now and make your dashboard feel more polished.</p>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-slate-50 p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Email address</h3>
                <p className="text-gray-700">{user.email}</p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification preferences</h3>
                <label className="flex items-center gap-3 text-gray-800">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Receive email updates about audit improvements</span>
                </label>
              </div>

              <div className="rounded-3xl bg-slate-50 p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme</h3>
                <div className="flex flex-col gap-3 sm:flex-row">
                  {['light', 'dark'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setThemeMode(mode)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        themeMode === mode
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
                      }`}
                    >
                      {mode === 'light' ? 'Light mode' : 'Dark mode'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-white font-semibold shadow-lg hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <p className="text-sm text-gray-500">Changes are stored locally in your browser.</p>
            </div>
          </section>

          <aside className="rounded-[2rem] bg-gradient-to-br from-emerald-600 to-green-500 text-white p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4">Profile quick info</h2>
            <p className="text-gray-100 leading-relaxed mb-6">
              Your profile settings help make SpendAudit feel more tailored to your team.
            </p>
            <ul className="space-y-4 text-sm">
              <li>• Email updates are optional and only control local reminders.</li>
              <li>• Theme mode can be activated across the dashboard on your next visit.</li>
              <li>• You can update these preferences anytime from the settings page.</li>
            </ul>
          </aside>
        </div>
      </main>
    </div>
  )
}
