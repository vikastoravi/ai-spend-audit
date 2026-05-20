import ToolRow from './ToolRow';

export default function AuditResults({ auditResult, summary }) {
  const { recommendations, totalMonthlySavings, totalAnnualSavings, isOptimal } = auditResult;

  const annualSavingsValue = totalAnnualSavings || totalMonthlySavings * 12;
  const isOptimized = totalMonthlySavings < 100 || isOptimal;

  return (
    <div className="bg-white rounded-4xl shadow-2xl border border-gray-200 overflow-hidden">
      <section className="px-6 py-10 lg:px-10 lg:py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Audit insights that move the needle
          </h2>
          <p className="mx-auto max-w-2xl text-base text-gray-600 leading-7">
            This report highlights the best ways to reduce AI spend while keeping tool access stable for your team.
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3 px-6 pb-10 lg:px-10">
        <div className="rounded-3xl bg-slate-50 p-5 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 mb-3">Monthly savings</p>
          <p className="text-3xl font-semibold text-slate-900">${totalMonthlySavings.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-5 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 mb-3">Annual impact</p>
          <p className="text-3xl font-semibold text-slate-900">${annualSavingsValue.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-5 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 mb-3">Optimization status</p>
          <p className={`text-3xl font-semibold ${isOptimized ? 'text-emerald-600' : 'text-slate-900'}`}>
            {isOptimized ? 'Aligned' : 'Actionable'}
          </p>
        </div>
      </div>

      {summary && (
        <div className="px-6 pb-10 lg:px-10">
          <div className="rounded-3xl bg-blue-50 border border-blue-100 p-6">
            <p className="text-base text-slate-700 leading-7">{summary}</p>
          </div>
        </div>
      )}

      <section className="px-6 pb-12 lg:px-10">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">Tool recommendations</h3>
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
            <div className="rounded-3xl border border-gray-200 bg-slate-50 p-8 text-center">
              <p className="text-lg font-semibold text-slate-900 mb-2">No recommendations at this time</p>
              <p className="text-slate-600">Your current AI stack appears efficient based on the information provided.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
