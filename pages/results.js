import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/lib/ToastContext';
import { runAudit } from '@/lib/auditEngine';
import AuditResults from '@/components/AuditResults';
import EmailCapture from '@/components/EmailCapture';

const FALLBACK_SUMMARY =
  'Your AI tool spending has been analyzed. Review the recommendations to optimize your costs.';

export default function ResultsPage() {
  const [auditResult, setAuditResult] = useState(null);
  const [formData, setFormData] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [savedAuditId, setSavedAuditId] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [error, setError] = useState(null);
  const [copyMessage, setCopyMessage] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const loadAudit = async () => {
      try {
        setLoading(true);

        const formDataJson = localStorage.getItem('audit-result-input');
        if (!formDataJson) {
          setError('No audit data found. Please run the audit first.');
          setLoading(false);
          return;
        }

        const parsedFormData = JSON.parse(formDataJson);
        setFormData(parsedFormData);

        const result = runAudit(parsedFormData);
        setAuditResult(result);

        await new Promise(resolve => setTimeout(resolve, 800));

        try {
          const response = await fetch('/api/generate-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ auditResult: result, formData: parsedFormData }),
          });

          if (response.ok) {
            const data = await response.json();
            setSummary(data.summary || FALLBACK_SUMMARY);
          } else {
            setSummary(FALLBACK_SUMMARY);
          }
        } catch (err) {
          console.error('Failed to generate summary:', err);
          setSummary(FALLBACK_SUMMARY);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading audit:', err);
        setError(err.message || 'Could not load audit results.');
        setLoading(false);
      }
    };

    loadAudit();
  }, []);

  const handleCaptureEmail = () => {
    setShowEmailModal(true);
  };

  const handleEmailSubmit = async (email, companyName, role) => {
    setSaveLoading(true);
    setSaveError(null);

    try {
      const saveResponse = await fetch('/api/save-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditResult,
          formData,
          email,
          companyName,
          role,
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.details || errorData.error || 'Failed to save audit');
      }

      const saveData = await saveResponse.json();
      const auditId = saveData.id;

      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            companyName,
            totalMonthlySavings: auditResult.totalMonthlySavings,
            auditId,
          }),
        });
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr);
      }

      setSavedAuditId(auditId);
      setShowEmailModal(false);
      setSaveLoading(false);
      showToast('Audit saved successfully', 'success');
    } catch (err) {
      console.error('Error in email submission:', err);
      setSaveError(err.message || 'Failed to save your audit');
      showToast(err.message || 'Failed to save your audit', 'error');
      setSaveLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!savedAuditId) return;
    const url = `${window.location.origin}/audit/${savedAuditId}`;
    navigator.clipboard.writeText(url);
    setCopyMessage('Audit link copied!');
    showToast('Audit link copied to clipboard', 'success');
    window.setTimeout(() => setCopyMessage(''), 2500);
  };

  const handleDownloadPDF = () => {
    if (!savedAuditId) return;
    window.location.href = `/api/generate-pdf?id=${savedAuditId}`;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100 px-4">
        <div className="max-w-lg bg-white rounded-3xl shadow-xl border border-gray-200 p-10 text-center">
          <h1 className="text-3xl font-bold text-red-700 mb-4">Unable to load audit</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link href="/" className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
            Run another audit
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !auditResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin h-14 w-14 rounded-full border-4 border-green-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4 text-lg">Analyzing your AI spend. One moment please…</p>
        </div>
      </div>
    );
  }

  if (savedAuditId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 px-4 py-16">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200 p-10 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Your audit was saved successfully</h2>
          <p className="text-gray-600 mb-8">Download the completed report or share the secure audit link with your team.</p>

          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition"
            >
              📥 Download PDF
            </button>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 text-slate-900 rounded-2xl font-semibold hover:bg-slate-200 transition"
            >
              📋 Copy audit link
            </button>
          </div>

          {copyMessage && <p className="text-green-700 font-medium mb-6">{copyMessage}</p>}

          <Link href="/" className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition">
            Run another audit
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[2fr_1fr] items-start">
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white border border-gray-200 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-8 py-10 text-white">
                <p className="uppercase tracking-[0.3em] text-sm font-semibold text-green-100 mb-4">AI Spend Audit</p>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                  Unlock clear savings for your AI stack
                </h1>
                <p className="max-w-3xl text-base md:text-lg text-green-100/90">
                  Review your audit summary below, explore the key recommendations, and save a professional report for your team.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3 p-8 bg-slate-50">
                <MetricCard label="Projected monthly savings" value={`$${auditResult.totalMonthlySavings?.toLocaleString() || 0}`} />
                <MetricCard label="Projected annual savings" value={`$${auditResult.totalAnnualSavings?.toLocaleString() || 0}`} />
                <MetricCard label="Recommendations" value={`${auditResult.recommendations?.length || 0}`} />
              </div>
            </div>

            <AuditResults
              auditResult={auditResult}
              summary={summary}
              onCaptureEmail={handleCaptureEmail}
            />
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white border border-gray-200 shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Save this report</h2>
              <p className="text-gray-600 mb-6">
                Download a polished PDF version with your savings breakdown and recommendations.
              </p>
              <a
                href="#"
                onClick={() => setShowEmailModal(true)}
                className="inline-flex w-full items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition"
              >
                📧 Save and email report
              </a>
              <button
                onClick={() => setShowEmailModal(true)}
                className="mt-4 inline-flex w-full items-center justify-center px-6 py-4 bg-slate-100 text-slate-900 rounded-2xl font-semibold hover:bg-slate-200 transition"
              >
                📨 Send to my inbox
              </button>
            </div>

            <div className="rounded-3xl bg-white border border-gray-200 shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What we analyze</h2>
              <ul className="space-y-3 text-gray-600">
                <li>• AI tool spend across your stack</li>
                <li>• Plan alignment and feature usage</li>
                <li>• Opportunity to reduce duplicate licensing</li>
                <li>• Monthly and annual savings potential</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {showEmailModal && (
        <EmailCapture
          onClose={() => setShowEmailModal(false)}
          onSubmit={handleEmailSubmit}
          totalSavings={auditResult.totalMonthlySavings}
          loading={saveLoading}
        />
      )}

      {saveError && (
        <div className="fixed bottom-5 right-5 bg-red-600 text-white px-5 py-4 rounded-2xl shadow-xl">
          {saveError}
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-lg">
      <p className="text-sm text-gray-500 uppercase tracking-[0.2em] mb-3">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
