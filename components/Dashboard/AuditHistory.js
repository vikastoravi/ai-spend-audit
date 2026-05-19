import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function AuditHistory({ audits = [], onDelete = () => {} }) {
  const router = useRouter()
  const [sortBy, setSortBy] = useState('newest')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Sort audits based on selection
  const sortedAudits = [...audits].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at)
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at)
      case 'highest':
        return (b.total_monthly_savings || 0) - (a.total_monthly_savings || 0)
      case 'lowest':
        return (a.total_monthly_savings || 0) - (b.total_monthly_savings || 0)
      default:
        return 0
    }
  })

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // Normalize each tool entry into a readable tool name
  const normalizeToolItem = (item) => {
    if (!item) return null
    if (typeof item === 'string') return item
    if (typeof item === 'object') {
      return item.tool || item.name || item.label || null
    }
    return null
  }

  // Get tools array
  const getTools = (toolsData) => {
    if (!toolsData) return []
    let parsedTools = []
    if (typeof toolsData === 'string') {
      try {
        parsedTools = JSON.parse(toolsData)
      } catch {
        parsedTools = []
      }
    } else if (Array.isArray(toolsData)) {
      parsedTools = toolsData
    }

    return parsedTools
      .map(normalizeToolItem)
      .filter(Boolean)
  }

  // Get status badge
  const getStatusBadge = (savings) => {
    if (savings > 500) {
      return { label: 'High Savings', color: 'bg-green-100 text-green-800' }
    } else if (savings < 100) {
      return { label: 'Optimal', color: 'bg-gray-100 text-gray-800' }
    } else {
      return { label: 'Savings Found', color: 'bg-yellow-100 text-yellow-800' }
    }
  }

  // Handle delete
  const handleDelete = (auditId) => {
    onDelete(auditId)
    setDeleteConfirm(null)
  }

  // Empty state
  if (sortedAudits.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No audits yet</h3>
        <p className="text-gray-600 mb-6">
          Run your first audit to see your AI spend breakdown
        </p>
        <Link
          href="/audit/new"
          className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          Run Your First Audit →
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Sort Dropdown */}
      <div className="mb-6 flex items-center gap-3">
        <label htmlFor="sort" className="text-sm font-medium text-gray-700">
          Sort by:
        </label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="highest">Highest savings</option>
          <option value="lowest">Lowest savings</option>
        </select>
      </div>

      {/* Audit Cards */}
      <div className="space-y-4">
        {sortedAudits.map((audit) => {
          const savings = audit.total_monthly_savings || 0
          const annualSavings = savings * 12
          const tools = getTools(audit.tools)
          const statusBadge = getStatusBadge(savings)

          return (
            <div
              key={audit.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              {/* Delete confirmation modal */}
              {deleteConfirm === audit.id && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                    <p className="text-gray-900 font-medium mb-4">
                      Delete this audit? This cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(audit.id)}
                        className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* LEFT SIDE */}
                <div className="flex-1 min-w-0">
                  {/* Date */}
                  <p className="text-sm text-gray-600 mb-2">
                    {formatDate(audit.created_at)}
                  </p>

                  {/* Tools */}
                  <p className="text-gray-900 font-medium mb-3">
                    {tools.length > 0 ? tools.join(', ') : 'Audit'}
                  </p>

                  {/* Use case badge */}
                  {audit.use_case && (
                    <div className="inline-block">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {audit.use_case}
                      </span>
                    </div>
                  )}
                </div>

                {/* RIGHT SIDE */}
                <div className="flex flex-col lg:items-end gap-4">
                  {/* Savings info */}
                  <div className="lg:text-right">
                    <p
                      className={`text-3xl font-bold mb-1 ${
                        savings > 0 ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {savings > 0 ? `$${savings.toLocaleString()}/mo` : 'Already optimal'}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${annualSavings.toLocaleString()}/yr
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}
                  >
                    {statusBadge.label}
                  </span>

                  {/* Action buttons */}
                  <div className="flex flex-wrap lg:flex-nowrap gap-2">
                    <button
                      onClick={() => router.push(`/audit/${audit.id}`)}
                      className="px-4 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                    >
                      View Report
                    </button>
                    <button
                      onClick={() => router.push('/audit/new')}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                      Re-run
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(audit.id)}
                      className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete audit"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
