import { NextResponse } from 'next/server'
import { upsertNewsSignals } from '@/db/queries'

const CYBER_NEWS_FEEDS = [
  { name: 'BleepingComputer', rssUrl: 'https://www.bleepingcomputer.com/feed/' },
  { name: 'The Hacker News', rssUrl: 'https://feeds.feedburner.com/TheHackersNews' },
  { name: 'Dark Reading', rssUrl: 'https://www.darkreading.com/rss.xml' },
  { name: 'SecurityWeek', rssUrl: 'https://www.securityweek.com/feed/' },
  { name: 'Krebs on Security', rssUrl: 'https://krebsonsecurity.com/feed/' },
]

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)
  const match = xml.match(regex)
  return (match?.[1] || match?.[2] || '').trim()
}

function extractItems(xml: string): string[] {
  const items: string[] = []
  const regex = /<item>([\s\S]*?)<\/item>|<entry>([\s\S]*?)<\/entry>/gi
  let match
  while ((match = regex.exec(xml)) !== null) {
    items.push(match[1] || match[2])
  }
  return items
}

function simpleSentiment(text: string): 'negative' | 'neutral' | 'positive' {
  const lower = text.toLowerCase()
  const negativeWords = ['attack', 'breach', 'hack', 'ransomware', 'vulnerability', 'exploit', 'threat', 'malware', 'compromise', 'stolen', 'leak', 'critical', 'zero-day', 'flaw', 'emergency']
  const positiveWords = ['patch', 'fix', 'secure', 'protect', 'mitigate', 'arrest', 'takedown', 'disrupted', 'recovered']
  const negScore = negativeWords.filter(w => lower.includes(w)).length
  const posScore = positiveWords.filter(w => lower.includes(w)).length
  if (negScore > posScore + 1) return 'negative'
  if (posScore > negScore) return 'positive'
  return 'neutral'
}

function relevanceScore(text: string, keywords: string[]): number {
  const lower = text.toLowerCase()
  let score = 0
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) score += 25
  }
  if (lower.includes('europe') || lower.includes('eu ') || lower.includes('germany') || lower.includes('dach')) score += 15
  if (lower.includes('critical infrastructure') || lower.includes('nis2') || lower.includes('dora')) score += 10
  return Math.min(score, 100)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const keywords = url.searchParams.get('keywords')?.split(',').map(k => k.trim()) || ['ransomware', 'threat intelligence', 'NIS2']
  const limit = parseInt(url.searchParams.get('limit') || '15')

  try {
    const feedPromises = CYBER_NEWS_FEEDS.map(async (feed) => {
      try {
        const res = await fetch(feed.rssUrl, {
          signal: AbortSignal.timeout(5000),
        })
        if (!res.ok) return []

        const xml = await res.text()
        const items = extractItems(xml)

        return items.slice(0, 10).map(item => {
          const title = extractTag(item, 'title')
          const link = extractTag(item, 'link') || extractTag(item, 'guid')
          const pubDate = extractTag(item, 'pubDate') || extractTag(item, 'published') || extractTag(item, 'updated')
          const description = extractTag(item, 'description') || extractTag(item, 'summary') || ''
          const fullText = `${title} ${description}`

          return {
            title: title.replace(/<[^>]*>/g, '').slice(0, 200),
            source: feed.name,
            publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            url: link.replace(/<[^>]*>/g, ''),
            sentiment: simpleSentiment(fullText),
            relevanceScore: relevanceScore(fullText, keywords),
          }
        })
      } catch {
        return []
      }
    })

    const allArticles = (await Promise.all(feedPromises))
      .flat()
      .filter(a => a.title && a.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore || new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit)

    if (allArticles.length > 0) {
      // Persist to DB (fire-and-forget)
      upsertNewsSignals(allArticles).catch(() => {})

      return NextResponse.json({
        articles: allArticles,
        source: 'rss-live',
        feedsQueried: CYBER_NEWS_FEEDS.length,
        lastUpdated: new Date().toISOString(),
      }, {
        headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=300' },
      })
    }

    return NextResponse.json({
      articles: getDemoNews(),
      source: 'demo',
      feedsQueried: 0,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('News feed error:', error)
    return NextResponse.json({
      articles: getDemoNews(),
      source: 'demo',
      feedsQueried: 0,
      lastUpdated: new Date().toISOString(),
    })
  }
}

function getDemoNews() {
  return [
    { title: 'LockBit Ransomware Gang Returns With New Encryptor Targeting Manufacturing', source: 'BleepingComputer', publishedAt: new Date(Date.now() - 86400000).toISOString(), url: '#', sentiment: 'negative' as const, relevanceScore: 85 },
    { title: 'EU Commission Takes Action on NIS2 Non-Compliance in Four Member States', source: 'SecurityWeek', publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(), url: '#', sentiment: 'negative' as const, relevanceScore: 80 },
    { title: 'ENISA Warns of Chinese State-Sponsored Threats to European Energy Sector', source: 'Dark Reading', publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(), url: '#', sentiment: 'negative' as const, relevanceScore: 90 },
    { title: 'German BSI Issues Emergency Advisory for Fortinet VPN Vulnerability', source: 'The Hacker News', publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(), url: '#', sentiment: 'negative' as const, relevanceScore: 75 },
  ]
}
