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
