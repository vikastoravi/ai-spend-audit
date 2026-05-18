export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, companyName, totalMonthlySavings, auditId } = req.body;

    // Validate required fields
    if (!email || totalMonthlySavings === undefined || !auditId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not set, skipping email send');
      return res.status(200).json({ success: true, skipped: true });
    }

    // Prepare email content
    const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const auditUrl = `${domain}/audit/${auditId}`;
    const companyDisplay = companyName || 'Valued Customer';

    const emailBody = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Your AI Spend Audit Report</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
      .header h1 { margin: 0; font-size: 28px; }
      .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
      .savings-box { background: white; border-left: 4px solid #4CAF50; padding: 20px; margin: 20px 0; border-radius: 4px; }
      .savings-amount { font-size: 32px; font-weight: bold; color: #4CAF50; }
      .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; margin: 20px 0; }
      .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Your AI Spend Audit Report</h1>
        <p>Unlock savings on AI tools</p>
      </div>
      <div class="content">
        <p>Hi ${companyDisplay},</p>
        <p>Thank you for using our AI Spend Audit tool! We've analyzed your AI tool spending and found some great optimization opportunities.</p>
        
        <div class="savings-box">
          <div>Potential Monthly Savings</div>
          <div class="savings-amount">$${totalMonthlySavings}/month</div>
          <div style="color: #666; margin-top: 8px;">That's $${totalMonthlySavings * 12}/year</div>
        </div>

        <p>Your detailed audit report is ready to review. Click the button below to see your personalized recommendations:</p>
        
        <div style="text-align: center;">
          <a href="${auditUrl}" class="button">View Your Full Report</a>
        </div>

        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <strong>Next Steps:</strong><br>
          1. Review your audit report above<br>
          2. Share with your team using the report URL<br>
          3. Implement the recommendations to start saving immediately
        </p>

        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Questions? Reply to this email or visit our website for more info.
        </p>
      </div>
      <div class="footer">
        <p>© 2026 AI Spend Audit. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
    `.trim();

    // Send email via Resend
    const sendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: email,
        subject: `Your AI Spend Audit Report — $${totalMonthlySavings}/month in savings`,
        html: emailBody,
      }),
    });

    if (!sendResponse.ok) {
      const errorData = await sendResponse.json();
      console.error('Resend API error:', errorData);
      // Don't fail the audit save if email fails
      return res.status(200).json({ success: true, emailError: errorData.message });
    }

    const sendData = await sendResponse.json();
    return res.status(200).json({ success: true, emailId: sendData.id });
  } catch (error) {
    console.error('Error in send-email:', error);
    // Don't fail the entire flow if email fails
    return res.status(200).json({ success: true, error: error.message });
  }
}
