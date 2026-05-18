import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import ToolRow from '../../components/ToolRow';

export default function AuditPage({ audit, domain }) {
  if (!audit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Audit not found</h1>
          <p className="text-gray-600 mb-8">This audit has been deleted or doesn't exist.</p>
          <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Run your own free audit
          </Link>
        </div>
      </div>
    );
  }

  const { total_monthly_savings, total_annual_savings, recommendations, is_high_savings, team_size, use_case } = audit;

  const pageTitle = `AI Spend Audit — Save $${total_monthly_savings}/month on AI tools`;
  const ogUrl = `https://${domain}/audit/${audit.id}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta property="og:title" content={`I found $${total_monthly_savings}/month in AI tool savings`} />
        <meta property="og:description" content="Free AI spend audit — see if your startup is overpaying for AI tools" />
        <meta property="og:url" content={ogUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`I found $${total_monthly_savings}/month in AI tool savings`} />
        <meta name="description" content="Free AI spend audit — see if your startup is overpaying for AI tools" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              ← Back to audit
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Potential savings: <span className="text-green-600">${total_monthly_savings}/month</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              That's <span className="font-semibold">${total_annual_savings}/year</span> for your team of {team_size}
            </p>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Optimization recommendations</h2>
            {recommendations && recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <ToolRow
                    key={idx}
                    tool={rec.tool}
                    currentCost={rec.currentSpend}
                    suggestedCost={rec.suggestedSpend}
                    reason={rec.reason}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No recommendations available.</p>
            )}
          </div>

          {/* VKGROUP CTA */}
          {is_high_savings && (
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-8 mb-8 text-white">
              <h3 className="text-2xl font-bold mb-2">Unlock even more savings with VKGROUP</h3>
              <p className="text-purple-100 mb-4">
                For high-savings cases like yours, VKGROUP can unlock an additional 20-30% through discounted credits.
              </p>
              <a
                href="#"
                className="inline-block bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Connect with VKGROUP
              </a>
            </div>
          )}

          {/* CTA Button */}
          <div className="text-center">
            <Link href="/" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition">
              Run your own free audit
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ params, req }) {
  const { id } = params;

  // Get domain for OG tags
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const domain = `${protocol}://${host}`.replace(/^https?:\/\//, '');

  try {
    // Fetch audit from Supabase
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

    // Strip private data before rendering publicly
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
