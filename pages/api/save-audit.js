import { getSupabaseAdmin } from '../../lib/supabaseAdmin';

// Simple in-memory rate limiting: IP -> { count, resetTime }
const rateLimitMap = {};
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms
const RATE_LIMIT_MAX = 5;

function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap[ip];

  if (!record || now > record.resetTime) {
    // Create or reset the record
    rateLimitMap[ip] = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
    return true; // Request allowed
  }

  record.count++;
  if (record.count > RATE_LIMIT_MAX) {
    return false; // Request rejected
  }

  return true; // Request allowed
}

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clientIP = getClientIP(req);

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({ error: 'Too many requests. Max 5 per hour.' });
    }

    const { auditResult, formData, email, companyName, role } = req.body;

    // Validate required fields
    if (!auditResult || !formData || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Prepare data for Supabase
    const auditData = {
      tools: JSON.stringify(formData.tools || []),
      recommendations: JSON.stringify(auditResult.recommendations || []),
      total_monthly_savings: auditResult.totalMonthlySavings || 0,
      total_annual_savings: auditResult.totalAnnualSavings || 0,
      total_current_spend: auditResult.totalCurrentSpend || 0,
      team_size: formData.teamSize || null,
      use_case: formData.useCase || null,
      email: email,
      company_name: companyName || null,
      role: role || null,
      is_high_savings: (auditResult.totalMonthlySavings || 0) > 500,
    };

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Server is not configured for Supabase admin access.' });
    }

    // Insert into Supabase using server-side admin credentials
    const { data, error } = await supabaseAdmin
      .from('audits')
      .insert([auditData])
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      console.error('Audit data attempted:', JSON.stringify(auditData));
      return res.status(500).json({ 
        error: 'Failed to save audit',
        details: error.message || 'Unknown Supabase error'
      });
    }

    return res.status(201).json({ id: data.id });
  } catch (error) {
    console.error('Error in save-audit:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
