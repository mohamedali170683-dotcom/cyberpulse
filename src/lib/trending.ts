import type { ThreatPulse, SearchDemandSignal } from './types'

/**
 * Detect trending signals — those with change exceeding 2x the median spike
 */
export function detectTrending(signals: SearchDemandSignal[]): SearchDemandSignal[] {
  if (signals.length === 0) return []

  const sorted = [...signals].sort((a, b) => a.changePercent - b.changePercent)
  const median = sorted[Math.floor(sorted.length / 2)].changePercent
  const threshold = Math.max(median * 2, 100) // at least 100% change

  return signals
    .filter(s => s.changePercent >= threshold)
    .sort((a, b) => b.changePercent - a.changePercent)
}

/**
 * Map threats to their correlated demand signals via tag matching
 */
export function correlateThreatsToSignals(
  threats: ThreatPulse[],
  signals: SearchDemandSignal[]
): Map<string, SearchDemandSignal[]> {
  const correlation = new Map<string, SearchDemandSignal[]>()

  for (const threat of threats) {
    const matchedSignals = signals.filter(signal => {
      const kw = signal.keyword.toLowerCase()
      return threat.tags.some(tag => kw.includes(tag.toLowerCase())) ||
        threat.title.toLowerCase().includes(kw) ||
        kw.includes(threat.category.toLowerCase())
    })
    correlation.set(threat.id, matchedSignals)
  }

  return correlation
}

/**
 * Estimate demand window duration and decay rate based on threat category
 */
export function calculateDemandWindow(threat: ThreatPulse): {
  peakDays: number
  totalDays: number
  decayRate: number
} {
  const windows: Record<string, { peakDays: number; totalDays: number; decayRate: number }> = {
    'Ransomware': { peakDays: 3, totalDays: 8, decayRate: 0.18 },
    'Nation-State/APT': { peakDays: 5, totalDays: 14, decayRate: 0.12 },
    'Vulnerability': { peakDays: 2, totalDays: 6, decayRate: 0.22 },
    'Regulatory': { peakDays: 7, totalDays: 21, decayRate: 0.08 },
    'Phishing': { peakDays: 2, totalDays: 5, decayRate: 0.25 },
    'Malware': { peakDays: 3, totalDays: 7, decayRate: 0.20 },
  }

  const category = Object.keys(windows).find(key =>
    threat.category.toLowerCase().includes(key.toLowerCase())
  )

  return windows[category || 'Malware'] || windows['Malware']
}

/**
 * Cross-keyword correlation: when one keyword spikes, related keywords also spike
 */
const CROSS_CORRELATIONS: Record<string, string[]> = {
  ransomware: ['incident response', 'cyber insurance', 'backup recovery', 'endpoint protection'],
  'nation-state': ['threat intelligence', 'apt detection', 'network monitoring', 'zero trust'],
  vulnerability: ['patch management', 'vulnerability scanner', 'penetration testing', 'cve'],
  nis2: ['compliance audit', 'risk assessment', 'security governance', 'dora compliance'],
  phishing: ['email security', 'security awareness training', 'anti-phishing', 'mfa'],
}

export function getCorrelatedKeywords(primaryKeyword: string): string[] {
  const kw = primaryKeyword.toLowerCase()
  for (const [key, related] of Object.entries(CROSS_CORRELATIONS)) {
    if (kw.includes(key)) return related
  }
  return []
}

/**
 * Apply time-decay to spike multipliers
 */
export function applyTimeDecay(baseSpikeMultiplier: number, daysSinceEvent: number, decayRate: number): number {
  return baseSpikeMultiplier * Math.exp(-decayRate * daysSinceEvent)
}

/**
 * Deterministic spike variance seeded by date (no jumps on refresh)
 */
export function deterministicVariance(keyword: string, date: string): number {
  let hash = 0
  const seed = keyword + date
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  // Map to 0.85-1.15 range
  return 0.85 + (Math.abs(hash) % 300) / 1000
}
