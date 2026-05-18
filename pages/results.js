import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const loadAudit = async () => {
      try {
        setLoading(true);

        // Get formData from localStorage
        const formDataJson = localStorage.getItem('audit-result-input');
        if (!formDataJson) {
          setError('No audit data found. Please run the audit first.');
          setLoading(false);
          return;
        }

        const parsedFormData = JSON.parse(formDataJson);
        setFormData(parsedFormData);

        // Run audit
        const result = runAudit(parsedFormData);
        setAuditResult(result);

        // Simulate 1 second loading
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Fetch summary from API
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
        setError(err.message);
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
      // Step 1: Save audit
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

      // Step 2: Send email
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
        // Continue anyway — audit is saved
      }

      // Step 3: Set saved ID and close modal
      setSavedAuditId(auditId);
      setShowEmailModal(false);
      setSaveLoading(false);
    } catch (err) {
      console.error('Error in email submission:', err);
      setSaveError(err.message || 'Failed to save your audit');
      setSaveLoading(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/audit/${savedAuditId}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
          <a
            href="/"
            className="mt-6 inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Back to Audit
          </a>
        </div>
      </div>
    );
  }

  if (loading || !auditResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
          <p className="text-gray-600 mt-4">Analyzing your AI spend...</p>
        </div>
      </div>
    );
  }

  // Show success state if audit was saved
  if (savedAuditId) {
    const handleDownloadPDF = () => {
      window.location.href = `/api/generate-pdf?id=${savedAuditId}`;
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Report saved!</h2>
            <p className="text-gray-600 mb-8">Download your audit report:</p>

            <button
              onClick={handleDownloadPDF}
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-medium mb-6 text-lg"
            >
              📥 Download PDF Report
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                Your report has been saved and is ready to download. The PDF contains all your audit details, recommendations, and savings analysis.
              </p>
            </div>

            <a
              href="/"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-medium"
            >
              Run another audit
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AuditResults
        auditResult={auditResult}
        summary={summary}
        onCaptureEmail={handleCaptureEmail}
      />

      {showEmailModal && (
        <EmailCapture
          onClose={() => setShowEmailModal(false)}
          onSubmit={handleEmailSubmit}
          totalSavings={auditResult.totalMonthlySavings}
        />
      )}

      {saveError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg">
          {saveError}
        </div>
      )}
    </div>
  );
}
