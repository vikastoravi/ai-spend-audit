import PDFDocument from 'pdfkit'
import { supabase } from '@/lib/supabase'
import {
  drawPageBackground,
  drawHorizontalLine,
  addPageNumber,
  addFooter,
} from '@/lib/pdfHelpers'
import { PRICING_DATA } from '@/lib/pricingData'

function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString()}`
}

function formatDate(isoString) {
  const date = isoString ? new Date(isoString) : new Date()
  if (Number.isNaN(date.getTime())) return new Date().toLocaleDateString('en-US')
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getToolName(toolKey) {
  if (!toolKey) return 'Unknown'
  if (typeof toolKey === 'string') {
    return PRICING_DATA[toolKey]?.name || toolKey
  }
  if (typeof toolKey === 'object') {
    return toolKey.name || toolKey.tool || 'Unknown'
  }
  return 'Unknown'
}

function parseJsonField(field) {
  if (!field) return []
  if (Array.isArray(field)) return field
  try {
    return JSON.parse(field)
  } catch {
    return []
  }
}

export default async function handler(req, res) {
  const isGet = req.method === 'GET'
  const isPost = req.method === 'POST'

  if (!isGet && !isPost) {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let auditResult = {}
  let formData = {}
  let userInfo = {}
  let generatedAt

  try {
    if (isPost) {
      const body = req.body || {}
      auditResult = body.auditResult || {}
      formData = body.formData || {}
      userInfo = body.userInfo || {}
      generatedAt = body.generatedAt
    } else {
      const { id } = req.query
      if (!id) {
        return res.status(400).json({ error: 'Audit ID required' })
      }

      const { data: audit, error } = await supabase
        .from('audits')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !audit) {
        console.error('Audit fetch failed:', error)
        return res.status(404).json({ error: 'Audit not found' })
      }

      const recommendations = parseJsonField(audit.recommendations)
      const tools = parseJsonField(audit.tools)

      auditResult = {
        recommendations,
        totalMonthlySavings: audit.total_monthly_savings ?? 0,
        totalAnnualSavings: audit.total_annual_savings ?? 0,
        totalCurrentSpend: audit.total_current_spend ?? 0,
        isOptimal: audit.is_optimal ?? false,
      }
      formData = {
        teamSize: audit.team_size ?? 0,
        useCase: audit.use_case || 'N/A',
        tools,
      }
      userInfo = {
        fullName: audit.full_name || audit.name || '',
        email: audit.email || '',
        company: audit.company || '',
      }
      generatedAt = audit.created_at || new Date().toISOString()
    }

    const {
      recommendations = [],
      totalMonthlySavings = 0,
      totalAnnualSavings = 0,
      totalCurrentSpend = 0,
      isOptimal = false,
    } = auditResult

    const {
      teamSize = 0,
      useCase = 'N/A',
      tools = [],
    } = formData

    const {
      fullName = '',
      email = '',
      company = '',
    } = userInfo

    const reportDate = formatDate(generatedAt)
    const toolCount = Array.isArray(tools) ? tools.length : 0
    const sortedTools = Array.isArray(recommendations) ? recommendations : []

    const doc = new PDFDocument({ size: 'A4', margin: 30 })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="spendaudit-report.pdf"')
    doc.pipe(res)

    // PAGE 1: COVER
    drawPageBackground(doc, '#15803d')
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(26)
    doc.text('SpendAudit', 30, 60, { align: 'center', width: doc.page.width - 60 })
    doc.font('Helvetica').fontSize(12)
    doc.text('AI Spend Report', { align: 'center' })

    doc.fontSize(11).fillColor('#ffffff').text(' ', 30, 130)

    if (!isOptimal) {
      doc.fontSize(11).text('Potential Monthly Savings', { align: 'center', width: doc.page.width - 60 })
      doc.font('Helvetica-Bold').fontSize(38).text(`${formatCurrency(totalMonthlySavings)}/month`, {
        align: 'center',
        width: doc.page.width - 60,
      })
      doc.font('Helvetica').fontSize(14).text(`${formatCurrency(totalAnnualSavings)}/year`, {
        align: 'center',
        width: doc.page.width - 60,
      })
    } else {
      doc.fontSize(16).text('✓ Already Optimized', { align: 'center', width: doc.page.width - 60 })
    }

    const cardWidth = (doc.page.width - 100) / 3
    drawCard(doc, 30, 300, cardWidth, formatCurrency(totalCurrentSpend), 'Spend/mo')
    drawCard(doc, 40 + cardWidth, 300, cardWidth, formatCurrency(totalMonthlySavings), 'Savings/mo')
    drawCard(doc, 50 + cardWidth * 2, 300, cardWidth, `${toolCount}`, 'Tools')

    doc.fontSize(8).fillColor('#ffffff').text(' ')
    doc.text(fullName || 'Audit Report', { align: 'center', width: doc.page.width - 60 })
    if (company) doc.text(company, { align: 'center', width: doc.page.width - 60 })
    doc.text(`${teamSize} people • ${reportDate}`, { align: 'center', width: doc.page.width - 60 })

    addFooter(doc, 'SpendAudit')
    addPageNumber(doc, 1)

    // PAGE 2: ANALYSIS & TOOLS
    doc.addPage()
    let y = 35

    doc.font('Helvetica-Bold').fontSize(14).fillColor('#111827')
    doc.text('Summary', 30, y)
    drawHorizontalLine(doc, y + 16, '#d1d5db', 1.5)
    y += 28

    doc.font('Helvetica').fontSize(9).fillColor('#4b5563')
    const summary = `${toolCount} tools analyzed. Current spend: ${formatCurrency(totalCurrentSpend)}/month. Opportunity: ${formatCurrency(totalMonthlySavings)}/month.`
    doc.text(summary, 30, y, { width: doc.page.width - 60, lineGap: 3 })
    y = doc.y + 10

    doc.font('Helvetica-Bold').fontSize(12).fillColor('#111827')
    doc.text('Top Recommendations', 30, y)
    y += 14

    const topRecs = sortedTools
      .filter((rec) => (rec.monthlySavings || rec.monthly_savings || 0) > 0)
      .sort((a, b) => (b.monthlySavings || b.monthly_savings || 0) - (a.monthlySavings || a.monthly_savings || 0))
      .slice(0, 4)

    topRecs.forEach((rec, index) => {
      const savings = rec.monthlySavings || rec.monthly_savings || 0
      const toolName = getToolName(rec.tool || rec.toolName)
      const action = rec.recommendedAction || rec.recommended_action || ''

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827')
      doc.text(`${index + 1}. ${toolName}`, 30, y, { width: doc.page.width - 120 })
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#15803d')
      doc.text(`$${savings || 0}/mo`, doc.page.width - 80, y - 2, { width: 50, align: 'right' })

      y += 13
      doc.font('Helvetica').fontSize(8).fillColor('#6b7280')
      doc.text(action || 'Optimize plan', 40, y, { width: doc.page.width - 100 })
      y = doc.y + 7
    })

    const callY = y
    doc.save()
    doc.roundedRect(30, callY, doc.page.width - 60, 45, 6).fill('#f0fdf4')
    doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(9)
    doc.text('→ Start with #1, validate usage, re-audit in 30 days.', 40, callY + 8, {
      width: doc.page.width - 100,
    })
    doc.restore()

    y = callY + 48

    doc.font('Helvetica-Bold').fontSize(12).fillColor('#111827')
    doc.text('All Tools', 30, y)
    y += 14

    sortedTools.forEach((rec) => {
      const pageBottom = doc.page.height - 60
      if (y > pageBottom) {
        addFooter(doc, 'SpendAudit')
        addPageNumber(doc, doc.pageNumber)
        doc.addPage()
        y = 35
      }

      const toolName = getToolName(rec.tool || rec.toolName)
      const plan = rec.currentPlan || rec.current_plan || 'Current'
      const spend = rec.currentSpend || rec.current_spend || 0
      const action = rec.recommendedAction || rec.recommended_action || ''
      const savings = rec.monthlySavings || rec.monthly_savings || 0

      doc.save()
      doc.roundedRect(30, y, doc.page.width - 60, 50, 5).stroke('#d1d5db')

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827')
      doc.text(toolName, 37, y + 6, { width: doc.page.width - 130 })

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#15803d')
      doc.text(`-$${savings || 0}`, doc.page.width - 80, y + 6, { width: 50, align: 'right' })

      doc.font('Helvetica').fontSize(8).fillColor('#4b5563')
      doc.text(`${plan} · $${Number(spend || 0).toLocaleString()}/mo`, 37, y + 22)

      doc.font('Helvetica').fontSize(8).fillColor('#111827')
      doc.text(action, 37, y + 34)

      doc.restore()

      y += 54
    })

    if (sortedTools.length > 0) {
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#15803d')
      doc.text(`Total: ${formatCurrency(totalMonthlySavings)}/mo`, 30, y, {
        align: 'right',
        width: doc.page.width - 60,
      })
    }

    addFooter(doc, 'SpendAudit')
    addPageNumber(doc, doc.pageNumber)

    doc.end()
  } catch (error) {
    console.error('PDF generation failed:', error)
    res.status(500).json({ error: 'PDF generation failed' })
  }
}

function drawCard(doc, x, y, width, value, label) {
  doc.save()
  doc.roundedRect(x, y, width, 60, 8).fillAndStroke('#ffffff', '#d1d5db')
  doc.font('Helvetica-Bold').fontSize(20).fillColor('#15803d')
  doc.text(value, x + 8, y + 10, { width: width - 16 })
  doc.font('Helvetica').fontSize(8).fillColor('#6b7280')
  doc.text(label, x + 8, y + 38, { width: width - 16 })
  doc.restore()
}
