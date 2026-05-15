import { useEffect, useState } from 'react';
import { runAudit } from '@/lib/auditEngine';
import AuditResults from '@/components/AuditResults';
import EmailCapture from '@/components/EmailCapture';

const FALLBACK_SUMMARY =
  'Your AI tool spending has been analyzed. Review the recommendations to optimize your costs.';

export default function ResultsPage() {
  const [auditResult, setAuditResult] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [savedAuditId, setSavedAuditId] = useState(null);
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

        const formData = JSON.parse(formDataJson);

        // Run audit
        const result = runAudit(formData);
        setAuditResult(result);

        // Simulate 1 second loading
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Fetch summary from API
        try {
          const response = await fetch('/api/generate-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ auditResult: result, formData }),
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

  const handleEmailSaved = (auditId) => {
    setSavedAuditId(auditId);
    setShowEmailModal(false);
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

  return (
    <div>
      <AuditResults
        auditResult={auditResult}
        summary={summary}
        onCaptureEmail={handleCaptureEmail}
      />

      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <EmailCapture
              auditResult={auditResult}
              onSaved={handleEmailSaved}
              onClose={() => setShowEmailModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
