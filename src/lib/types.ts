// ─── CyberPulse Core Types ──────────────────────────────────────

export interface ThreatPulse {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  source: string
  publishedAt: string
  tags: string[]
  cves: string[]
  region: string
  affectedIndustry: string
  url?: string
}

export interface SearchDemandSignal {
  keyword: string
  currentVolume: number
  previousVolume: number
  changePercent: number
  trend: 'rising' | 'stable' | 'declining'
  relatedQueries: string[]
}

export interface NewsSignal {
  title: string
  source: string
  publishedAt: string
  url: string
  sentiment: 'negative' | 'neutral' | 'positive'
  relevanceScore: number
}

export interface LiveThreatDashboard {
  threats: ThreatPulse[]
  searchSignals: SearchDemandSignal[]
  newsSignals: NewsSignal[]
  lastUpdated: string
  status: 'live' | 'cached' | 'demo'
}

// ─── Campaign Types ─────────────────────────────────────────────

export interface ChannelExecution {
  channel: string
  tactic: string
  budget: string
  expectedLeads: string
  cpl: string
  timeline: string
}

export interface CampaignBrief {
  demandWindow: string
  decayRate: string
  audiencePrimary: string
  audienceSecondary: string
  audienceSize: string
  messagingHook: string
  messagingValue: string
  messagingCta: string
  messagingCompliance: string
  channels: ChannelExecution[]
  expectedPipeline: string
  kpis: string[]
}

export interface Campaign {
  id: string
  threatId: string
  title: string
  status: 'draft' | 'active' | 'completed'
  brief: CampaignBrief
  generatedBy: 'ai' | 'curated'
  createdAt: string
  updatedAt: string
}

// ─── Notification Types ─────────────────────────────────────────

export interface NotificationConfig {
  slackWebhookUrl?: string
  emailRecipients?: string[]
  severityThreshold: 'critical' | 'high' | 'medium' | 'low'
  demandSpikeThreshold: number
  enabled: boolean
}

// ─── API Response Types ─────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  source: string
  lastUpdated: string
}

export interface ApiError {
  error: string
  code: string
  details?: unknown
}
