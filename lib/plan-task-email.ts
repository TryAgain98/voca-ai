import { Resend } from 'resend'

import type { TaskNotificationKind } from '~/types'

interface TaskReminderEmailParams {
  to: string
  kind: TaskNotificationKind
  tasks: Array<{ title: string; startTime: string; endTime: string }>
  appUrl: string
  fromAddress: string
}

const KIND_COPY: Record<
  TaskNotificationKind,
  { heading: string; cta: string }
> = {
  not_started: {
    heading: 'should have started',
    cta: 'Start now',
  },
  not_finished: {
    heading: 'are past their end time',
    cta: 'Mark as done',
  },
}

function subjectFor(kind: TaskNotificationKind, count: number): string {
  const label = count === 1 ? 'task' : 'tasks'
  return kind === 'not_started'
    ? `⏰ ${count} ${label} should have started`
    : `🔔 ${count} ${label} past their end time`
}

function renderHtml(params: TaskReminderEmailParams): string {
  const { kind, tasks, appUrl } = params
  const copy = KIND_COPY[kind]
  const ctaHref = `${appUrl}/en/admin/today`

  const rows = tasks
    .map(
      (task) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
          <p style="color:#f7f8f8;font-size:14px;font-weight:600;margin:0 0 2px 0;">${task.title}</p>
          <p style="color:#8a8f98;font-size:12px;margin:0;">${task.startTime} – ${task.endTime}</p>
        </td>
      </tr>`,
    )
    .join('')

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#0f1011;font-family:Inter,system-ui,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f1011;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#191a1b;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:32px;">
          <tr>
            <td>
              <h1 style="color:#f7f8f8;font-size:20px;font-weight:600;letter-spacing:-0.5px;margin:0 0 8px 0;">
                ${tasks.length} task${tasks.length === 1 ? '' : 's'} ${copy.heading}
              </h1>
              <p style="color:#d0d6e0;font-size:14px;line-height:1.5;margin:0 0 20px 0;">
                Here's what needs your attention today.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${rows}
              </table>
              <a href="${ctaHref}" style="display:inline-block;margin-top:24px;background:#5e6ad2;color:#ffffff;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;">
                ${copy.cta}
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendTaskReminder(
  params: TaskReminderEmailParams,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured')

  const resend = new Resend(apiKey)
  const html = renderHtml(params)

  const { error } = await resend.emails.send({
    from: params.fromAddress,
    to: params.to,
    subject: subjectFor(params.kind, params.tasks.length),
    html,
  })
  if (error) throw error
}
