import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server not configured: missing Supabase service key' })
  }

  try {
    const { teamSize, useCase, tools, user_id } = req.body

    // Validate required fields
    if (!user_id || !tools || !Array.isArray(tools)) {
      return res.status(400).json({ error: 'Missing required fields: user_id, tools array' })
    }

    // Calculate total monthly savings (simplified logic)
    let totalMonthlySavings = 0
    tools.forEach(tool => {
      // Estimate 10-15% savings on each tool
      const savings = (tool.monthlySpend || 0) * 0.12
      totalMonthlySavings += savings
    })

    // Create audit record in Supabase using admin client (bypasses RLS)
    const { data: audit, error: insertError } = await supabaseAdmin
      .from('audits')
      .insert({
        user_id,
        team_size: parseInt(teamSize) || 0,
        use_case: useCase || 'general',
        tools: tools,
        total_monthly_savings: Math.round(totalMonthlySavings),
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return res.status(500).json({ error: 'Failed to create audit: ' + insertError.message })
    }

    return res.status(200).json({
      success: true,
      audit_id: audit.id,
      audit,
    })
  } catch (err) {
    console.error('Create audit error:', err)
    return res.status(500).json({ error: err.message })
  }
}
