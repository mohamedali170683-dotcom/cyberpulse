import { NextResponse } from 'next/server'
import { upsertThreats, getRecentThreats } from '@/db/queries'
import { triggerNotifications } from '@/lib/notifications'

const OTX_BASE = 'https://otx.alienvault.com/api/v1'

function classifySeverity(pulse: any): 'critical' | 'high' | 'medium' | 'low' {
  const tags = (pulse.tags || []).map((t: string) => t.toLowerCase())
  const name = (pulse.name || '').toLowerCase()
  if (tags.some((t: string) => ['apt', 'ransomware', 'critical', 'zero-day', 'nation-state'].includes(t)) ||
      name.includes('ransomware') || name.includes('apt') || name.includes('zero-day')) return 'critical'
  if (tags.some((t: string) => ['malware', 'exploit', 'vulnerability', 'cve'].includes(t)) ||
      name.includes('malware') || name.includes('exploit')) return 'high'
  if (tags.some((t: string) => ['phishing', 'campaign', 'trojan'].includes(t))) return 'medium'
  return 'low'
}

function classifyCategory(pulse: any): string {
  const tags = (pulse.tags || []).map((t: string) => t.toLowerCase())
  const name = (pulse.name || '').toLowerCase()
  if (tags.includes('ransomware') || name.includes('ransomware')) return 'Ransomware'
  if (tags.includes('apt') || name.includes('apt')) return 'Nation-State / APT'
  if (tags.includes('phishing') || name.includes('phishing')) return 'Phishing'
  if (tags.some((t: string) => ['cve', 'vulnerability', 'exploit'].includes(t))) return 'Vulnerability'
  if (tags.includes('malware') || name.includes('malware')) return 'Malware'
  return 'Threat Intelligence'
}

function extractCVEs(pulse: any): string[] {
  const text = `${pulse.name} ${pulse.description} ${(pulse.tags || []).join(' ')}`
  const matches = text.match(/CVE-\d{4}-\d{4,}/gi)
  return matches ? [...new Set(matches.map((c: string) => c.toUpperCase()))] : []
}

function inferRegion(pulse: any): string {
  const text = `${pulse.name} ${pulse.description}`.toLowerCase()
  if (text.includes('germany') || text.includes('german') || text.includes('dach') || text.includes('deutsch')) return 'DACH'
  if (text.includes('europe') || text.includes('eu ') || text.includes('european')) return 'EU-wide'
  if (text.includes('nordic') || text.includes('scandinav')) return 'Nordics'
  if (text.includes('uk') || text.includes('britain')) return 'UK'
  return 'Global'
}

function inferIndustry(pulse: any): string {
  const text = `${pulse.name} ${pulse.description}`.toLowerCase()
  if (text.includes('energy') || text.includes('power') || text.includes('grid') || text.includes('utility')) return 'Energy & Utilities'
  if (text.includes('financ') || text.includes('bank') || text.includes('insurance')) return 'Financial Services'
  if (text.includes('health') || text.includes('hospital') || text.includes('medical')) return 'Healthcare'
  if (text.includes('manufactur') || text.includes('industrial') || text.includes('ot ') || text.includes('scada')) return 'Manufacturing'
  if (text.includes('government') || text.includes('defense') || text.includes('military')) return 'Government & Defense'
  return 'Cross-sector'
}

function getDateNDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

export async function GET() {
  try {
    let pulses: any[] = []

    const response = await fetch(`${OTX_BASE}/pulses/subscribed?limit=20&page=1&modified_since=${getDateNDaysAgo(14)}`, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      const activityResponse = await fetch(`${OTX_BASE}/pulses/activity?limit=20&page=1`, {
        headers: { Accept: 'application/json' },
      })
      if (activityResponse.ok) {
        const data = await activityResponse.json()
        pulses = data.results || []
      }
    } else {
      const data = await response.json()
      pulses = data.results || []
    }

    if (pulses.length === 0) {
      // Try DB cache before demo data
      const cached = await getRecentThreats(15)
      if (cached.length > 0) {
        return NextResponse.json({
          threats: cached.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            severity: t.severity,
            category: t.category,
            source: t.source,
            publishedAt: t.publishedAt.toISOString(),
            tags: t.tags,
            cves: t.cves,
            region: t.region,
            affectedIndustry: t.affectedIndustry,
            url: t.url,
          })),
          source: 'database-cache',
          lastUpdated: new Date().toISOString(),
        }, {
          headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=600' },
        })
      }

      return NextResponse.json({
        threats: getDemoThreats(),
        source: 'demo',
        lastUpdated: new Date().toISOString(),
      })
    }

    const threats = pulses.slice(0, 15).map((pulse: any) => ({
      id: pulse.id || `pulse-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: pulse.name || 'Unknown Threat',
      description: (pulse.description || '').slice(0, 500),
      severity: classifySeverity(pulse),
      category: classifyCategory(pulse),
      source: 'AlienVault OTX',
      publishedAt: pulse.created || pulse.modified || new Date().toISOString(),
      tags: (pulse.tags || []).slice(0, 8),
      cves: extractCVEs(pulse),
      region: inferRegion(pulse),
      affectedIndustry: inferIndustry(pulse),
      url: `https://otx.alienvault.com/pulse/${pulse.id}`,
    }))

    // Persist to DB (fire-and-forget)
    upsertThreats(threats).catch(err => console.error('DB upsert error:', err))

    // Trigger notifications for critical/high threats (fire-and-forget)
    for (const threat of threats) {
      if (threat.severity === 'critical' || threat.severity === 'high') {
        triggerNotifications(threat).catch(err => console.error('Notification error:', err))
      }
    }

    return NextResponse.json({
      threats,
      source: 'otx-live',
      lastUpdated: new Date().toISOString(),
    }, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=600' },
    })
  } catch (error) {
    console.error('Threat feed error:', error)
    return NextResponse.json({
      threats: getDemoThreats(),
      source: 'demo',
      lastUpdated: new Date().toISOString(),
    })
  }
}

function getDemoThreats() {
  return [
    {
      id: 'demo-1',
      title: 'LockBit 4.0 Successor Targets European Manufacturing',
      description: 'New ransomware strain linked to LockBit affiliates observed targeting manufacturing sector in DACH region through unpatched Fortinet VPN appliances.',
      severity: 'critical',
      category: 'Ransomware',
      source: 'Demo Data',
      publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      tags: ['ransomware', 'lockbit', 'manufacturing', 'dach', 'fortinet'],
      cves: ['CVE-2024-47575'],
      region: 'DACH',
      affectedIndustry: 'Manufacturing',
    },
    {
      id: 'demo-2',
      title: 'Volt Typhoon Infrastructure Detected in EU Energy Networks',
      description: 'ENISA advisory warns of Chinese state-sponsored group pre-positioning in European critical energy infrastructure using living-off-the-land techniques.',
      severity: 'critical',
      category: 'Nation-State / APT',
      source: 'Demo Data',
      publishedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      tags: ['apt', 'nation-state', 'china', 'energy', 'critical-infrastructure'],
      cves: [],
      region: 'EU-wide',
      affectedIndustry: 'Energy & Utilities',
    },
    {
      id: 'demo-3',
      title: 'NIS2 Enforcement Wave \u2014 Commission Acts Against 4 Member States',
      description: 'European Commission launches infringement proceedings for inadequate NIS2 transposition, signaling real regulatory enforcement across essential entities.',
      severity: 'high',
      category: 'Regulatory',
      source: 'Demo Data',
      publishedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      tags: ['nis2', 'compliance', 'regulation', 'eu'],
      cves: [],
      region: 'EU-wide',
      affectedIndustry: 'All regulated sectors',
    },
  ]
}
