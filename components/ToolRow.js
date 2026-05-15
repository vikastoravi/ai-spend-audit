export default function ToolRow({
  toolName,
  currentPlan,
  currentSpend,
  recommendedAction,
  monthlySavings,
  annualSavings,
  reason,
  status,
}) {
  const borderColor = {
    save: 'border-l-4 border-green-500',
    optimal: 'border-l-4 border-gray-300',
    consider: 'border-l-4 border-yellow-500',
  }[status];

  const savingsColor = {
    save: 'text-green-600 font-semibold',
    optimal: 'text-gray-500',
    consider: 'text-yellow-600',
  }[status];

  return (
    <div className={`${borderColor} bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow`}>
      {/* Header: Tool name */}
      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
        {toolName}
      </h3>

      {/* Current plan and spend */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Plan:</span> {currentPlan}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Current spend:</span> ${currentSpend}/month
        </div>
      </div>

      {/* Recommendation section */}
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
          <span className="text-gray-700 text-sm md:text-base">
            {recommendedAction}
          </span>
          <span className="hidden md:inline text-gray-400">→</span>
          {status === 'optimal' ? (
            <span className={`text-sm md:text-base ${savingsColor}`}>
              Already optimal
            </span>
          ) : (
            <span className={`text-sm md:text-base ${savingsColor}`}>
              Save ${monthlySavings}/month (${annualSavings}/year)
            </span>
          )}
        </div>
      </div>

      {/* Reason text */}
      <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
        {reason}
      </p>

      {/* Status badge */}
      <div className="mt-4 flex gap-2">
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
            status === 'save'
              ? 'bg-green-100 text-green-800'
              : status === 'optimal'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {status === 'save' ? 'Save Money' : status === 'optimal' ? 'Optimal' : 'Consider'}
        </span>
      </div>
    </div>
  );
}
