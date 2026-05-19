import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Navbar({ user }) {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const getInitial = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase()
    }
    return user?.email?.charAt(0).toUpperCase() || '?'
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await supabase.auth.signOut()
      setIsDropdownOpen(false)
      setIsMobileMenuOpen(false)
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      setIsSigningOut(false)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-green-600 hover:text-green-700 transition-colors tracking-tight">
              SpendAudit
            </span>
            <span className="ml-2 text-sm text-gray-500 hidden sm:inline">AI savings intelligence</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Get Started Free
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Dashboard
                </Link>

                {/* Avatar Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold hover:bg-green-700 transition-colors"
                  >
                    {getInitial()}
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      {/* User Email */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>

                      {/* Dashboard Link */}
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>

                      {/* Settings Link */}
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Settings
                      </Link>

                      {/* Divider */}
                      <div className="border-t border-gray-100" />

                      {/* Sign Out Button */}
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSigningOut && (
                          <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                        )}
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMobileMenuOpen
                    ? 'M6 18L18 6M6 6l12 12'
                    : 'M4 6h16M4 12h16M4 18h16'
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-2">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started Free
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>

                <Link
                  href="/settings"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </Link>

                <div className="border-t border-gray-100 my-2" />

                <div className="px-4 py-2 text-sm text-gray-500 mb-2">
                  {user.email}
                </div>

                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSigningOut && (
                    <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                  )}
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
