'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Bell, Mail, MessageSquare, Shield, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const [slackUrl, setSlackUrl] = useState('')
  const [emailRecipients, setEmailRecipients] = useState('')
  const [severityThreshold, setSeverityThreshold] = useState<string>('high')
  const [spikeThreshold, setSpikeThreshold] = useState('200')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Settings are stored via environment variables on Vercel
    // This UI is for documentation / local configuration
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure notifications and alert thresholds</p>
      </div>

      {/* Slack */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare size={18} className="text-purple-400" />
            Slack Notifications
          </CardTitle>
          <CardDescription>
            Receive alerts in Slack when high-severity threats are detected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Webhook URL</label>
            <Input
              placeholder="https://hooks.slack.com/services/..."
              value={slackUrl}
              onChange={(e) => setSlackUrl(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Set via SLACK_WEBHOOK_URL environment variable on Vercel
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail size={18} className="text-blue-400" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Send email alerts via Resend when threats match your criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Recipients (comma-separated)</label>
            <Input
              placeholder="ciso@example.com, soc@example.com"
              value={emailRecipients}
              onChange={(e) => setEmailRecipients(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Set via ALERT_EMAIL_RECIPIENTS environment variable. Requires RESEND_API_KEY.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield size={18} className="text-orange-400" />
            Alert Thresholds
          </CardTitle>
          <CardDescription>
            Control when notifications are triggered
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Minimum Severity</label>
            <div className="flex gap-2">
              {['critical', 'high', 'medium', 'low'].map(level => (
                <button
                  key={level}
                  onClick={() => setSeverityThreshold(level)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    severityThreshold === level
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Only threats at or above this severity will trigger alerts
            </p>
          </div>

          <Separator />

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Minimum Demand Spike (%)</label>
            <Input
              type="number"
              placeholder="200"
              value={spikeThreshold}
              onChange={(e) => setSpikeThreshold(e.target.value)}
              className="w-32"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Alerts only when correlated search demand exceeds this threshold
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell size={18} className="text-green-400" />
            Environment Variables
          </CardTitle>
          <CardDescription>Required variables for full functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-xs">
            {[
              { key: 'POSTGRES_URL', desc: 'Neon database connection', required: false },
              { key: 'AI_GATEWAY_API_KEY', desc: 'Vercel AI Gateway key', required: false },
              { key: 'SLACK_WEBHOOK_URL', desc: 'Slack incoming webhook', required: false },
              { key: 'RESEND_API_KEY', desc: 'Resend email API key', required: false },
              { key: 'ALERT_EMAIL_RECIPIENTS', desc: 'Comma-separated emails', required: false },
            ].map(v => (
              <div key={v.key} className="flex items-center justify-between p-2 rounded bg-muted/30">
                <span className="text-foreground">{v.key}</span>
                <Badge variant="outline" className="text-[10px]">{v.desc}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">
        {saved ? (
          <><CheckCircle2 size={16} /> Settings noted</>
        ) : (
          'Save Settings'
        )}
      </Button>
    </div>
  )
}
