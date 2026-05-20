import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseAuth } from '@/lib/useSupabaseAuth';
import { supabase } from '../../lib/supabase';
import ToolRow from '../../components/ToolRow';

export default function AuditPage({ audit, domain }) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useSupabaseAuth()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, router, user])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-center px-6 py-10 bg-white rounded-3xl shadow-xl border border-gray-200">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-700">Checking login status…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!audit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-center px-6 py-10 bg-white rounded-3xl shadow-xl border border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Audit not found</h1>
          <p className="text-gray-600 mb-8">This audit has been deleted or doesn&apos;t exist.</p>
          <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            Run your own free audit
          </Link>
        </div>
      </div>
    );
  }

  const totalMonthlySavings = audit.total_monthly_savings ?? 0;
  const totalAnnualSavings = audit.total_annual_savings ?? totalMonthlySavings * 12;
  const teamSize = audit.team_size || 1;
  const useCase = audit.use_case || 'General AI productivity';
  const recommendations = parseJsonField(audit.recommendations);
  const tools = parseJsonField(audit.tools);
  const pageTitle = `AI Spend Audit — Save $${totalMonthlySavings}/month on AI tools`;
  const ogUrl = `https://${domain}/audit/${audit.id}`;
  const hasRecommendations = recommendations.length > 0;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta property="og:title" content={`I found $${totalMonthlySavings}/month in AI tool savings`} />
        <meta property="og:description" content="Free AI spend audit — see if your team is overpaying for AI tools." />
        <meta property="og:url" content={ogUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`I found $${totalMonthlySavings}/month in AI tool savings`} />
        <meta name="description" content="Free AI spend audit — see if your team is overpaying for AI tools." />
      </Head>

      <div className="min-h-screen bg-linear-to-br from-blue-50 via-slate-100 to-indigo-100">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Back to audit
            </Link>
            <a
              href={`/api/generate-pdf?id=${audit.id}`}
              className="inline-flex items-center gap-2 bg-white text-blue-700 px-5 py-3 rounded-full shadow-sm border border-blue-100 hover:shadow-md transition"
            >
              📥 Download PDF
            </a>
          </div>

          <div className="rounded-4xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-linear-to-r from-green-600 to-emerald-600 px-8 py-10 text-white">
              <div className="max-w-3xl mx-auto text-center">
                <p className="uppercase tracking-[0.3em] text-sm font-semibold text-green-100 mb-4">AI Spend Audit Report</p>
                <h1 className="text-5xl font-bold tracking-tight mb-4">
                  Potential savings: <span className="text-white">${totalMonthlySavings.toLocaleString()}/month</span>
                </h1>
                <p className="text-xl text-green-100 mb-6">
                  That&apos;s <span className="font-semibold">${totalAnnualSavings.toLocaleString()}/year</span> for your team of {teamSize}
                </p>
                <p className="max-w-2xl mx-auto text-sm md:text-base text-green-100/90">
                  This audit identifies cost-saving opportunities across your AI tool stack, with clear recommendations you can share with stakeholders.
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3 p-8 bg-slate-50">
              <StatCard label="Team size" value={teamSize} />
              <StatCard label="Primary use case" value={useCase} />
              <StatCard label="Tools reviewed" value={Array.isArray(tools) ? tools.length : 'N/A'} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3 p-8">
              <SummaryCard title="Monthly savings" value={`$${totalMonthlySavings.toLocaleString()}/month`} />
              <SummaryCard title="Annual savings" value={`$${totalAnnualSavings.toLocaleString()}/year`} />
              <SummaryCard title="High savings" value={audit.is_high_savings ? 'Yes' : 'No'} />
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.8fr_1fr]">
            <section className="space-y-6">
              <div className="rounded-3xl bg-white border border-gray-200 shadow-xl p-8">
                <div className="flex items-center justify-between gap-4 mb-8">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Recommendations</p>
                    <h2 className="text-3xl font-bold text-gray-900">Optimization plan</h2>
                  </div>
                  <div className="rounded-full bg-green-50 text-green-700 px-4 py-2 text-sm font-semibold">
                    {hasRecommendations ? `${recommendations.length} suggestions` : 'No suggestions'}
                  </div>
                </div>

                {hasRecommendations ? (
                  <div className="space-y-6">
                    {recommendations.map((rec, idx) => {
                      const recommendation = normalizeRecommendation(rec);
                      return (
                        <ToolRow
                          key={idx}
                          toolName={recommendation.toolName}
                          currentPlan={recommendation.currentPlan}
                          currentSpend={recommendation.currentSpend}
                          recommendedAction={recommendation.recommendedAction}
                          monthlySavings={recommendation.monthlySavings}
                          annualSavings={recommendation.annualSavings}
                          reason={recommendation.reason}
                          status={recommendation.status}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-gray-300 bg-slate-50 px-8 py-12 text-center">
                    <p className="text-xl font-semibold text-gray-900 mb-2">No recommendations available.</p>
                    <p className="text-gray-600 max-w-xl mx-auto">
                      Your current AI stack is already aligned, or this audit did not identify practical savings opportunities this time.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-white border border-gray-200 shadow-xl p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Executive summary</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This audit analyzes your AI tools and recommends targeted cost reductions while keeping your team productive. Focus on the items below with the highest savings per month.
                </p>
                <ul className="space-y-3 text-gray-700 list-disc list-inside">
                  <li>Review tool recommendations and update plans where savings are highest.</li>
                  <li>Keep your AI stack aligned with actual usage patterns.</li>
                  <li>Re-run this audit whenever your team adds new AI tools.</li>
                </ul>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl bg-white border border-gray-200 shadow-xl p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Report package</h3>
                <p className="text-gray-600 mb-6">
                  Download a polished PDF version of this audit to share with leadership or your finance team.
                </p>
                <a
                  href={`/api/generate-pdf?id=${audit.id}`}
                  className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-2xl transition"
                >
                  Download PDF report
                </a>
              </div>

              <div className="rounded-3xl bg-white border border-gray-200 shadow-xl p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Share the audit</h3>
                <p className="text-gray-600 mb-5">
                  Copy the audit link and share it with your team or stakeholders.
                </p>
                <button
                  onClick={() => copyAuditLink(audit.id)}
                  className="inline-flex items-center justify-center w-full bg-slate-100 hover:bg-slate-200 text-gray-900 font-semibold px-6 py-3 rounded-2xl transition"
                >
                  Copy audit link
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl bg-white border border-gray-200 p-6 text-center shadow-lg">
      <p className="text-sm text-gray-500 uppercase tracking-[0.2em] mb-3">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-lg">
      <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function parseJsonField(field) {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    return JSON.parse(field);
  } catch {
    return [];
  }
}

function normalizeRecommendation(rec) {
  const recommendation = typeof rec === 'string' ? parseJsonField(rec) : rec || {};

  const currentSpend = Number(recommendation.currentSpend ?? recommendation.current_spend ?? recommendation.spend ?? 0);
  const suggestedSpend = Number(recommendation.recommendedSpend ?? recommendation.suggested_spend ?? recommendation.suggestedSpend ?? 0);
  const monthlySavings = Number(
    recommendation.monthlySavings ?? recommendation.savings ?? Math.max(0, currentSpend - suggestedSpend)
  );

  const currentPlan = recommendation.currentPlan || recommendation.current_plan || recommendation.plan || 'Current plan';
  const recommendedAction = recommendation.recommendedAction || recommendation.recommended_action || suggestionText(recommendation, suggestedSpend);

  return {
    toolName: recommendation.tool || recommendation.name || 'Tool',
    currentPlan,
    currentSpend,
    recommendedAction,
    monthlySavings,
    annualSavings: Number(recommendation.annualSavings ?? monthlySavings * 12),
    reason: recommendation.reason || recommendation.note || 'Review this tool to reduce spend while preserving capability.',
    status: recommendation.status || determineStatus(monthlySavings),
  };
}

function suggestionText(recommendation, suggestedSpend) {
  if (recommendation.recommendedAction || recommendation.recommended_action) {
    return recommendation.recommendedAction || recommendation.recommended_action;
  }
  if (recommendation.recommendedPlan || recommendation.recommended_plan || recommendation.suggestedPlan) {
    return `Switch to ${recommendation.recommendedPlan || recommendation.recommended_plan || recommendation.suggestedPlan}`;
  }
  if (suggestedSpend) {
    return `Adjust spend to $${suggestedSpend}/month`;
  }
  return 'Review the plan and usage to reduce cost.';
}

function determineStatus(monthlySavings) {
  if (monthlySavings > 250) return 'save';
  if (monthlySavings > 50) return 'consider';
  return 'optimal';
}

function copyAuditLink(id) {
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/audit/${id}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
    window.alert('Audit link copied to clipboard!');
  }
}

export async function getServerSideProps({ params, req }) {
  const { id } = params;

  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') || 'ai-spend-audit-indol.vercel.app';
  const domain = `${protocol}://${host}`.replace(/^https?:\/\//, '');

  try {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return {
        notFound: true,
      };
    }

    data.email = null;
    data.company_name = null;

    return {
      props: {
        audit: data,
        domain,
      },
    };
  } catch (error) {
    console.error('Error fetching audit:', error);
    return {
      notFound: true,
    };
  }
}
