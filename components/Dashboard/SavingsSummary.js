export default function SavingsSummary({ audits = [] }) {
  // Calculate metrics
  const totalPotentialSavings = audits.reduce((sum, audit) => sum + (audit.total_monthly_savings || 0), 0)
  const totalAuditsRun = audits.length
  const bestSingleSaving = audits.length > 0 ? Math.max(...audits.map(a => a.total_monthly_savings || 0)) : 0
  const annualSavings = totalPotentialSavings * 12

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const cards = [
    {
      title: 'Total Monthly Savings Found',
      value: formatCurrency(totalPotentialSavings),
      subtext: 'across all your audits',
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8L5.257 19.393A2 2 0 005 18.07V5a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-.757 1.563z" />
        </svg>
      ),
      iconBg: 'bg-green-50',
      valueColor: 'text-green-600',
    },
    {
      title: 'Audits Run',
      value: totalAuditsRun.toString(),
      subtext: 'total audits completed',
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      iconBg: 'bg-blue-50',
      valueColor: 'text-blue-600',
    },
    {
      title: 'Best Single Audit',
      value: formatCurrency(bestSingleSaving),
      subtext: 'most savings found in one audit',
      icon: (
        <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      iconBg: 'bg-yellow-50',
      valueColor: 'text-yellow-600',
    },
    {
      title: 'Annual Savings Potential',
      value: formatCurrency(annualSavings),
      subtext: 'if all recommendations followed',
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      iconBg: 'bg-green-50',
      valueColor: 'text-green-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform transition-all duration-150 p-6"
        >
          {/* Icon */}
          <div className={`${card.iconBg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
            {card.icon}
          </div>

          {/* Title */}
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            {card.title}
          </h3>

          {/* Value */}
          <p className={`text-3xl font-bold ${card.valueColor} mb-1`}>
            {card.value}
          </p>

          {/* Subtext */}
          <p className="text-xs text-gray-500">
            {card.subtext}
          </p>
        </div>
      ))}
    </div>
  )
}
