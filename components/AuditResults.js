import ToolRow from './ToolRow';

export default function AuditResults({ auditResult, summary, onCaptureEmail }) {
  const { recommendations, totalMonthlySavings, totalAnnualSavings, isOptimal } = auditResult;

  const isOptimized = totalMonthlySavings < 100 || isOptimal;
  const showVKGroupCTA = totalMonthlySavings > 500;

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert('Audit link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Hero Section */}
      <section className="pt-12 md:pt-20 pb-12 md:pb-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Your AI Spend Audit
          </h1>

          {isOptimized ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8">
              <p className="text-3xl md:text-4xl font-bold text-green-600">
                You're already spending well on AI tools 🎉
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 md:p-12 mb-8">
              <div className="text-5xl md:text-6xl font-bold text-green-600 mb-3">
                ${totalMonthlySavings.toLocaleString()}/month
              </div>
              <div className="text-xl md:text-2xl text-gray-600">
                That's ${totalAnnualSavings.toLocaleString()}/year
              </div>
            </div>
          )}

          {/* AI Summary */}
          {summary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <p className="text-gray-700 text-lg leading-relaxed">
                {summary}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* VKGROUP CTA Section */}
      {showVKGroupCTA && (
        <section className="py-12 md:py-16 px-4 bg-gradient-to-r from-green-500 to-emerald-500">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                You could save even more with VKGROUP discounted AI credits
              </h2>
              <a
                href="https://credex.rocks"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-green-600 font-semibold px-6 md:px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Book a Free VKGROUP Consultation →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Per-Tool Breakdown Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Per-Tool Breakdown
          </h2>

          <div className="space-y-4">
            {recommendations && recommendations.length > 0 ? (
              recommendations.map((rec, idx) => (
                <ToolRow
                  key={idx}
                  toolName={rec.tool}
                  currentPlan={rec.currentPlan}
                  currentSpend={rec.currentSpend}
                  recommendedAction={rec.recommendedAction}
                  monthlySavings={rec.monthlySavings}
                  annualSavings={rec.annualSavings}
                  reason={rec.reason}
                  status={rec.status}
                />
              ))
            ) : (
              <p className="text-gray-600 text-center py-8">
                No recommendations at this time.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Email Capture Section */}
      <section className="py-12 md:py-16 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {totalMonthlySavings > 500
              ? 'Save this report and we\'ll connect you with VKGROUP'
              : 'Get notified when new optimizations apply to your stack'}
          </h2>
          <p className="text-gray-600 mb-6">
            {totalMonthlySavings > 500
              ? 'Our team will reach out with personalized recommendations and exclusive deals.'
              : 'We\'ll email you when we add new tools or detect changes in your spending.'}
          </p>
          <button
            onClick={onCaptureEmail}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Get My Report
          </button>
        </div>
      </section>

      {/* Share Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Share your audit
          </h2>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold px-6 md:px-8 py-3 rounded-lg transition-colors"
            >
              📋 Copy Link
            </button>
            <button
              onClick={onCaptureEmail}
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 md:px-8 py-3 rounded-lg transition-colors"
            >
              📥 Download PDF
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
