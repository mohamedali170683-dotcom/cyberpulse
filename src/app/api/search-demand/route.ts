import { NextResponse } from 'next/server'
import { deterministicVariance, getCorrelatedKeywords } from '@/lib/trending'
import { insertSearchSignals } from '@/db/queries'

const CYBERSECURITY_KEYWORD_MAP: Record<string, {
  baseVolume: number
  spikeMultiplier: number
  relatedQueries: string[]
}> = {
  'ransomware': { baseVolume: 2400, spikeMultiplier: 3.2, relatedQueries: ['ransomware protection', 'ransomware recovery', 'ransomware insurance', 'anti-ransomware tools'] },
  'lockbit': { baseVolume: 880, spikeMultiplier: 4.5, relatedQueries: ['lockbit decryptor', 'lockbit mitigation', 'lockbit IOC', 'lockbit 4.0 indicators'] },
  'nis2': { baseVolume: 1200, spikeMultiplier: 3.8, relatedQueries: ['NIS2 compliance requirements', 'NIS2 Umsetzung', 'NIS2 board liability', 'NIS2 penalties'] },
  'volt typhoon': { baseVolume: 320, spikeMultiplier: 8.5, relatedQueries: ['Volt Typhoon IOC', 'Chinese APT energy', 'critical infrastructure protection', 'LOTL detection'] },
  'apt': { baseVolume: 1800, spikeMultiplier: 2.1, relatedQueries: ['APT detection', 'advanced persistent threat protection', 'threat intelligence platform', 'APT hunting'] },
  'threat intelligence': { baseVolume: 3200, spikeMultiplier: 2.5, relatedQueries: ['threat intelligence platform comparison', 'cyber threat intelligence', 'threat intelligence feeds', 'TIP vendor'] },
  'critical infrastructure': { baseVolume: 1600, spikeMultiplier: 2.8, relatedQueries: ['critical infrastructure protection', 'OT security', 'SCADA security', 'ICS threat detection'] },
  'dora compliance': { baseVolume: 720, spikeMultiplier: 3.0, relatedQueries: ['DORA regulation', 'DORA financial services', 'DORA ICT risk', 'DORA compliance deadline'] },
  'phishing': { baseVolume: 5400, spikeMultiplier: 1.8, relatedQueries: ['phishing protection', 'anti-phishing training', 'spear phishing detection', 'email security'] },
  'zero-day': { baseVolume: 1400, spikeMultiplier: 5.2, relatedQueries: ['zero-day exploit', 'zero-day vulnerability', 'zero-day patch', 'zero-day protection'] },
  'incident response': { baseVolume: 2800, spikeMultiplier: 2.0, relatedQueries: ['incident response plan', 'IR retainer', 'DFIR services', 'incident response playbook'] },
  'cyber insurance': { baseVolume: 1900, spikeMultiplier: 2.2, relatedQueries: ['cyber insurance cost', 'cyber liability insurance', 'ransomware insurance coverage'] },
  'zero trust': { baseVolume: 4100, spikeMultiplier: 1.6, relatedQueries: ['zero trust architecture', 'zero trust network', 'ZTNA vendors', 'zero trust implementation'] },
  'vulnerability management': { baseVolume: 2200, spikeMultiplier: 1.9, relatedQueries: ['vulnerability scanner', 'patch management', 'vulnerability assessment tools'] },
  'ot security': { baseVolume: 950, spikeMultiplier: 3.5, relatedQueries: ['OT security monitoring', 'ICS security', 'SCADA protection', 'OT network segmentation'] },
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const keywords = url.searchParams.get('keywords')?.split(',').map(k => k.trim().toLowerCase()) || []
  const threatTags = url.searchParams.get('tags')?.split(',').map(t => t.trim().toLowerCase()) || []

  const allTerms = [...new Set([...keywords, ...threatTags])]
  const today = new Date().toISOString().split('T')[0]

  // Build signals with deterministic variance + cross-keyword correlation
  const matchedKeywords = new Set<string>()
  const signals: any[] = []

  for (const term of allTerms) {
    const matchKey = Object.keys(CYBERSECURITY_KEYWORD_MAP).find(
      key => term.includes(key) || key.includes(term)
    )
    if (!matchKey || matchedKeywords.has(matchKey)) continue
    matchedKeywords.add(matchKey)

    const data = CYBERSECURITY_KEYWORD_MAP[matchKey]
    const variance = deterministicVariance(matchKey, today)
    const currentVolume = Math.round(data.baseVolume * data.spikeMultiplier * variance)
    const changePercent = Math.round(((currentVolume - data.baseVolume) / data.baseVolume) * 100)

    signals.push({
      keyword: matchKey,
      currentVolume,
      previousVolume: data.baseVolume,
      changePercent,
      trend: changePercent > 50 ? 'rising' as const : changePercent > 0 ? 'stable' as const : 'declining' as const,
      relatedQueries: data.relatedQueries,
    })

    // Add correlated keywords (at reduced spike)
    const correlated = getCorrelatedKeywords(matchKey)
    for (const corrKey of correlated) {
      const corrMatch = Object.keys(CYBERSECURITY_KEYWORD_MAP).find(k => k.includes(corrKey) || corrKey.includes(k))
      if (corrMatch && !matchedKeywords.has(corrMatch)) {
        matchedKeywords.add(corrMatch)
        const corrData = CYBERSECURITY_KEYWORD_MAP[corrMatch]
        const corrVariance = deterministicVariance(corrMatch, today)
        const corrVolume = Math.round(corrData.baseVolume * (1 + (corrData.spikeMultiplier - 1) * 0.4) * corrVariance)
        const corrChange = Math.round(((corrVolume - corrData.baseVolume) / corrData.baseVolume) * 100)

        signals.push({
          keyword: corrMatch,
          currentVolume: corrVolume,
          previousVolume: corrData.baseVolume,
          changePercent: corrChange,
          trend: corrChange > 50 ? 'rising' as const : 'stable' as const,
          relatedQueries: corrData.relatedQueries,
        })
      }
    }
  }

  // Fallback to top keywords
  if (signals.length === 0) {
    for (const [keyword, data] of Object.entries(CYBERSECURITY_KEYWORD_MAP).slice(0, 8)) {
      const variance = deterministicVariance(keyword, today)
      const currentVolume = Math.round(data.baseVolume * data.spikeMultiplier * variance)
      signals.push({
        keyword,
        currentVolume,
        previousVolume: data.baseVolume,
        changePercent: Math.round(((currentVolume - data.baseVolume) / data.baseVolume) * 100),
        trend: 'rising' as const,
        relatedQueries: data.relatedQueries,
      })
    }
  }

  signals.sort((a, b) => b.changePercent - a.changePercent)

  // Persist to DB (fire-and-forget)
  insertSearchSignals(signals.map(s => ({ ...s, source: 'curated-model' }))).catch(() => {})

  return NextResponse.json({
    signals,
    source: 'curated-model',
    lastUpdated: new Date().toISOString(),
  }, {
    headers: { 'Cache-Control': 's-maxage=900, stale-while-revalidate=300' },
  })
}
