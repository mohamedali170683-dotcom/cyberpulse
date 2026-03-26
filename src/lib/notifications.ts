import type { ThreatPulse, NotificationConfig } from './types'

interface SlackBlock {
  type: string
  text?: { type: string; text: string; emoji?: boolean }
  elements?: { type: string; text: string }[]
  fields?: { type: string; text: string }[]
}

export function shouldNotify(
  threat: ThreatPulse,
  demandSpikePercent: number,
  config: NotificationConfig
): boolean {
  if (!config.enabled) return false

  const severityRank = { critical: 4, high: 3, medium: 2, low: 1 }
  const thresholdRank = severityRank[config.severityThreshold] ?? 2
  const threatRank = severityRank[threat.severity] ?? 1

  if (threatRank < thresholdRank) return false
  if (demandSpikePercent < config.demandSpikeThreshold) return false

  return true
}

export async function sendSlackAlert(
  webhookUrl: string,
  threat: ThreatPulse,
  topKeyword?: { keyword: string; changePercent: number }
): Promise<boolean> {
  const severityEmoji: Record<string, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
  }

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${severityEmoji[threat.severity] || '⚪'} CyberPulse Alert: ${threat.title}`,
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Severity:* ${threat.severity.toUpperCase()}` },
        { type: 'mrkdwn', text: `*Category:* ${threat.category}` },
        { type: 'mrkdwn', text: `*Region:* ${threat.region}` },
        { type: 'mrkdwn', text: `*Industry:* ${threat.affectedIndustry}` },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: threat.description.slice(0, 300) + (threat.description.length > 300 ? '...' : ''),
      },
    },
  ]

  if (topKeyword) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📈 *Search Demand Spike:* "${topKeyword.keyword}" +${topKeyword.changePercent}%`,
      },
    })
  }

  if (threat.cves.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🔒 *CVEs:* ${threat.cves.join(', ')}`,
      },
    })
  }

  blocks.push({
    type: 'context',
    elements: [
      { type: 'mrkdwn', text: `Source: ${threat.source} | Published: ${threat.publishedAt}` },
    ],
  })

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    })
    return response.ok
  } catch (error) {
    console.error('Slack notification failed:', error)
    return false
  }
}

export async function sendEmailAlert(
  apiKey: string,
  recipients: string[],
  threat: ThreatPulse,
  topKeyword?: { keyword: string; changePercent: number }
): Promise<boolean> {
  if (recipients.length === 0) return false

  const demandLine = topKeyword
    ? `\n\nSearch Demand Spike: "${topKeyword.keyword}" +${topKeyword.changePercent}%`
    : ''

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'CyberPulse <alerts@cyberpulse.dev>',
        to: recipients,
        subject: `[${threat.severity.toUpperCase()}] ${threat.title}`,
        text: `CyberPulse Threat Alert\n\nTitle: ${threat.title}\nSeverity: ${threat.severity}\nCategory: ${threat.category}\nRegion: ${threat.region}\nIndustry: ${threat.affectedIndustry}\n\n${threat.description.slice(0, 500)}${demandLine}\n\nCVEs: ${threat.cves.join(', ') || 'None identified'}`,
      }),
    })
    return response.ok
  } catch (error) {
    console.error('Email notification failed:', error)
    return false
  }
}

export async function triggerNotifications(
  threat: ThreatPulse,
  topKeyword?: { keyword: string; changePercent: number }
) {
  const promises: Promise<boolean>[] = []

  const slackUrl = process.env.SLACK_WEBHOOK_URL
  if (slackUrl) {
    promises.push(sendSlackAlert(slackUrl, threat, topKeyword))
  }

  const resendKey = process.env.RESEND_API_KEY
  const emailRecipients = process.env.ALERT_EMAIL_RECIPIENTS?.split(',').map(e => e.trim()).filter(Boolean) || []
  if (resendKey && emailRecipients.length > 0) {
    promises.push(sendEmailAlert(resendKey, emailRecipients, threat, topKeyword))
  }

  if (promises.length > 0) {
    await Promise.allSettled(promises)
  }
}
