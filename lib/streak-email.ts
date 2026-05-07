import { Resend } from 'resend'

interface ReminderEmailParams {
  to: string
  currentStreak: number
  freezesRemaining: number
  appUrl: string
  fromAddress: string
}

function renderHtml(params: ReminderEmailParams): string {
  const { currentStreak, freezesRemaining, appUrl } = params
  const flameRow = '🔥'.repeat(Math.min(currentStreak, 7))
  const freezeNote =
    freezesRemaining > 0
      ? `You still have ${freezesRemaining} streak ${freezesRemaining === 1 ? 'freeze' : 'freezes'}, but they auto-burn — finish a quiz to keep your streak naturally.`
      : 'You have no streak freezes left. If you skip today, your streak resets to 1.'

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#0f1011;font-family:Inter,system-ui,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f1011;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#191a1b;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:32px;">
          <tr>
            <td style="text-align:center;">
              <div style="font-size:32px;margin-bottom:16px;">${flameRow}</div>
              <h1 style="color:#f7f8f8;font-size:22px;font-weight:600;letter-spacing:-0.5px;margin:0 0 8px 0;">
                Your ${currentStreak}-day streak is at risk
              </h1>
              <p style="color:#d0d6e0;font-size:15px;line-height:1.5;margin:0 0 24px 0;">
                You haven't taken a test yet today. A quick 2-minute quiz keeps the chain alive.
              </p>
              <a href="${appUrl}" style="display:inline-block;background:#5e6ad2;color:#ffffff;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;">
                Take a quick test
              </a>
              <p style="color:#8a8f98;font-size:13px;line-height:1.5;margin:24px 0 0 0;">
                ${freezeNote}
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;margin-top:24px;">
              <p style="color:#8a8f98;font-size:12px;text-align:center;margin:0;">
                You're receiving this because daily reminders are enabled.
                <a href="${appUrl}/admin/settings" style="color:#7170ff;text-decoration:none;">Turn off in Settings</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendStreakReminder(
  params: ReminderEmailParams,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured')

  const resend = new Resend(apiKey)
  const html = renderHtml(params)

  const { error } = await resend.emails.send({
    from: params.fromAddress,
    to: params.to,
    subject: `🔥 Don't break your ${params.currentStreak}-day streak`,
    html,
  })
  if (error) throw error
}
