import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import Link from 'next/link'

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const value = payload[0].value
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-semibold text-green-600">
          ${value.toLocaleString()}/month savings
        </p>
      </div>
    )
  }
  return null
}

export default function SavingsChart({ audits = [] }) {
  // Process and sort audits by date
  const chartData = audits
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((audit) => {
      const date = new Date(audit.created_at)
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      return {
        date: dateStr,
        savings: audit.total_monthly_savings || 0,
      }
    })

  // Custom Y-axis formatter
  const formatYAxis = (value) => {
    return `$${(value / 1000).toFixed(0)}k`
  }

  // Empty state
  if (chartData.length < 2) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900">Savings Found Per Audit</h2>
          <p className="text-sm text-gray-600 mt-1">
            Monthly savings identified in each audit
          </p>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
          <svg
            className="w-12 h-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-gray-500 text-center mb-6">
            Run at least 2 audits to see your savings trend
          </p>
          <div className="text-center">
            <Link href="/audit/new" className="text-green-600 font-medium hover:underline">
              Run New Audit — start your first audit
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Chart view
  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">Savings Found Per Audit</h2>
        <p className="text-sm text-gray-600 mt-1">
          Monthly savings identified in each audit
        </p>
      </div>

      {/* Chart */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              tickFormatter={formatYAxis}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="savings"
              fill="#16a34a"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
