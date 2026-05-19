import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export default async function handler(req, res) {
  // Only allow DELETE method
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { auditId, userId } = req.body

    // Validate auditId
    if (!auditId) {
      return res.status(400).json({ error: 'auditId is required' })
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Server not configured for admin access' })
    }

    let query = supabaseAdmin.from('audits').delete().eq('id', auditId)
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { error: deleteError, count } = await query

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return res.status(500).json({ error: deleteError.message })
    }

    return res.status(200).json({ success: true, message: 'Audit deleted successfully', count })
  } catch (err) {
    console.error('Delete audit handler error:', err)
    return res.status(500).json({ error: 'Failed to delete audit: ' + err.message })
  }
}
