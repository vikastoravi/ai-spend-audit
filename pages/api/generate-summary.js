export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { auditResult, formData } = req.body;

    // Validate inputs
    if (!auditResult) {
      return res.status(400).json({ error: 'auditResult is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not set, using fallback summary');
      const fallback = generateFallbackSummary(auditResult, formData);
      return res.status(200).json({ summary: fallback });
    }

    // Call Gemini API
    try {
      const summary = await callGeminiAPI(auditResult, formData, apiKey);
      return res.status(200).json({ summary });
    } catch (err) {
      console.error('Gemini API error:', err.message);
      const fallback = generateFallbackSummary(auditResult, formData);
      return res.status(200).json({ summary: fallback });
    }
  } catch (error) {
    console.error('Error in generate-summary:', error);
    // Return fallback on any error
    const fallback = generateFallbackSummary(
      req.body?.auditResult,
      req.body?.formData
    );
    return res.status(200).json({ summary: fallback });
  }
}

async function callGeminiAPI(auditResult, formData, apiKey) {
  const teamSize = formData?.teamSize || 'Unknown';
  const useCase = formData?.useCase || 'general';

  const prompt = `You are an AI spend optimization advisor. Given this audit result, write a personalized 100-word summary paragraph for the user. Be specific about their tools and savings. Be encouraging but honest. Don't use bullet points — write flowing prose.
Audit data: ${JSON.stringify(auditResult)}
Team size: ${teamSize}
Primary use case: ${useCase}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Extract text from Gemini response
  if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error('Invalid response format from Gemini API');
}

function generateFallbackSummary(auditResult, formData) {
  if (!auditResult) {
    return 'Your AI tool spending analysis is ready. Review the recommendations to optimize your costs.';
  }

  const teamSize = formData?.teamSize || 'Your team';

  // Calculate total current spend
  const totalCurrentSpend = auditResult.recommendations?.reduce((sum, rec) => {
    return sum + (rec.currentSpend || 0);
  }, 0) || 0;

  const toolCount = auditResult.recommendations?.length || 0;
  const savings = auditResult.totalMonthlySavings || 0;

  const topRec = auditResult.recommendations?.[0];
  const topTool = topRec?.tool || 'your current tools';

  let summary = `Your team of ${teamSize} is spending $${totalCurrentSpend}/month on AI tools across ${toolCount} platforms. Our audit found $${savings}/month in potential savings. Your biggest opportunity is ${topTool}.`;

  if (savings > 500) {
    summary += ' VKGROUP discounted credits could amplify these savings further.';
  } else if (auditResult.isOptimal) {
    summary += " You're already spending efficiently — well done.";
  }

  return summary;
}
