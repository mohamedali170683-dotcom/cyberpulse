'use client'

import { useState, useEffect } from 'react'
import {
  Radio, AlertTriangle, TrendingUp, Newspaper, Shield, Globe,
  RefreshCw, ExternalLink, Clock, Activity, Zap, ChevronDown,
  ChevronUp, Search, Tag
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────

interface ThreatPulse {
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

interface SearchSignal {
  keyword: string
  currentVolume: number
  previousVolume: number
  changePercent: number
  trend: string
  relatedQueries: string[]
}

interface NewsArticle {
  title: string
  source: string
  publishedAt: string
  url: string
  sentiment: string
  relevanceScore: number
}

// ─── Helpers ────────────────────────────────────────────────────

function SeverityBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium uppercase ${styles[level] || styles.low}`}>
      {level}
    </span>
  )
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const hours = Math.floor((now - then) / 3600000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function SentimentDot({ sentiment }: { sentiment: string }) {
  const colors: Record<string, string> = {
    negative: 'bg-red-500',
    neutral: 'bg-gray-400',
    positive: 'bg-green-500',
  }
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[sentiment] || colors.neutral}`} />
}

// ─── Main Component ─────────────────────────────────────────────

export default function LiveFeed() {
  const [threats, setThreats] = useState<ThreatPulse[]>([])
  const [searchSignals, setSearchSignals] = useState<SearchSignal[]>([])
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [sources, setSources] = useState({ threats: '', search: '', news: '' })
  const [lastUpdated, setLastUpdated] = useState('')
  const [selectedThreat, setSelectedThreat] = useState<ThreatPulse | null>(null)
  const [expandedPanel, setExpandedPanel] = useState<string | null>('threats')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [threatRes, searchRes, newsRes] = await Promise.all([
        fetch('/api/threats'),
        fetch('/api/search-demand?tags=ransomware,apt,nis2,threat+intelligence,zero-day,critical+infrastructure'),
        fetch('/api/news?keywords=ransomware,NIS2,threat+intelligence,APT,zero-day'),
      ])

      const threatData = await threatRes.json()
      const searchData = await searchRes.json()
      const newsData = await newsRes.json()

      setThreats(threatData.threats || [])
      setSearchSignals(searchData.signals || [])
      setNews(newsData.articles || [])
      setSources({
        threats: threatData.source || 'unknown',
        search: searchData.source || 'unknown',
        news: newsData.source || 'unknown',
      })
      setLastUpdated(new Date().toISOString())
    } catch (err) {
      console.error('Failed to fetch live data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // When a threat is selected, fetch correlated search signals
  useEffect(() => {
    if (!selectedThreat) return
    const tags = selectedThreat.tags.join(',')
    fetch(`/api/search-demand?tags=${encodeURIComponent(tags)}`)
      .then(res => res.json())
      .then(data => {
        if (data.signals?.length > 0) setSearchSignals(data.signals)
      })
      .catch(() => {})
  }, [selectedThreat])

  const togglePanel = (panel: string) =>
    setExpandedPanel(expandedPanel === panel ? null : panel)

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900 border border-gray-800">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <Radio size={11} className={sources.threats === 'otx-live' || sources.news === 'rss-live' ? 'text-green-400 animate-pulse' : 'text-yellow-400'} />
            {sources.threats === 'otx-live' ? 'Live feeds active' : sources.threats === 'demo' ? 'Demo mode' : 'Connecting...'}
          </span>
          <span className="flex items-center gap-1.5">
            <Activity size={11} className="text-blue-400" />
            {threats.length} threats · {searchSignals.length} demand signals · {news.length} articles
          </span>
          {lastUpdated && (
            <span className="flex items-center gap-1.5">
              <Clock size={11} />
              Updated {timeAgo(lastUpdated)}
            </span>
          )}
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-400 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && threats.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-10 h-10 rounded-full border-2 border-gray-700 border-t-red-500 animate-spin" />
          <p className="mt-4 text-sm text-gray-500">Connecting to threat feeds...</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          {/* Left: Live Threat Feed */}
          <div className="col-span-5">
            <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
              <button
                onClick={() => togglePanel('threats')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-400" />
                  <span className="font-semibold text-sm text-white">Live Threat Feed</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">{threats.length}</span>
                </div>
                {expandedPanel === 'threats' ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
              </button>

              {expandedPanel === 'threats' && (
                <div className="px-3 pb-3 space-y-2 max-h-[520px] overflow-y-auto">
                  {threats.map((threat) => (
                    <button
                      key={threat.id}
                      onClick={() => setSelectedThreat(threat)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedThreat?.id === threat.id
                          ? 'bg-gray-800 border-red-500/40'
                          : 'bg-gray-800/30 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <SeverityBadge level={threat.severity} />
                        <span className="text-xs text-gray-600">{timeAgo(threat.publishedAt)}</span>
                      </div>
                      <h3 className="text-xs font-semibold text-gray-200 leading-snug mb-1.5">{threat.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1"><Globe size={9} />{threat.region}</span>
                        <span className="flex items-center gap-1"><Shield size={9} />{threat.affectedIndustry}</span>
                        <span className="flex items-center gap-1"><Tag size={9} />{threat.category}</span>
                      </div>
                      {threat.cves.length > 0 && (
                        <div className="mt-1.5 flex gap-1 flex-wrap">
                          {threat.cves.slice(0, 3).map(cve => (
                            <span key={cve} className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">{cve}</span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Correlated Signals */}
          <div className="col-span-7 space-y-4">
            {/* Threat Detail */}
            {selectedThreat && (
              <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <SeverityBadge level={selectedThreat.severity} />
                      <span className="text-xs text-gray-500">{selectedThreat.source}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{selectedThreat.title}</h3>
                  </div>
                  {selectedThreat.url && selectedThreat.url !== '#' && (
                    <a href={selectedThreat.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-300">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-3">{selectedThreat.description}</p>
                <div className="flex gap-1.5 flex-wrap">
                  {selectedThreat.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Search Demand Correlation */}
            <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
              <button
                onClick={() => togglePanel('search')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Search size={14} className="text-blue-400" />
                  <span className="font-semibold text-sm text-white">Search Demand Correlation</span>
                </div>
                {expandedPanel === 'search' ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
              </button>

              {expandedPanel === 'search' && (
                <div className="px-4 pb-4 space-y-2">
                  {searchSignals.map((signal, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-800/40">
                      <div className="flex-1">
                        <span className="text-xs font-medium text-gray-300">{signal.keyword}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-500 rounded-full" style={{ width: `${Math.min(100, (signal.previousVolume / (signal.currentVolume || 1)) * 100)}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{signal.previousVolume.toLocaleString()}</span>
                          <span className="text-xs text-gray-600">→</span>
                          <div className="w-20 h-1.5 bg-red-900/30 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }} />
                          </div>
                          <span className="text-xs font-bold text-red-400">{signal.currentVolume.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <span className={`text-sm font-bold ${signal.changePercent > 200 ? 'text-red-400' : signal.changePercent > 100 ? 'text-orange-400' : 'text-yellow-400'}`}>
                          +{signal.changePercent}%
                        </span>
                        <div className="flex items-center gap-1 justify-end">
                          <TrendingUp size={10} className="text-red-400" />
                          <span className="text-xs text-gray-500">{signal.trend}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* News Coverage */}
            <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
              <button
                onClick={() => togglePanel('news')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Newspaper size={14} className="text-orange-400" />
                  <span className="font-semibold text-sm text-white">News Coverage</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">{news.length} articles</span>
                </div>
                {expandedPanel === 'news' ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
              </button>

              {expandedPanel === 'news' && (
                <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
                  {news.map((article, i) => (
                    <a
                      key={i}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-800/40 hover:bg-gray-800/60 transition-colors group"
                    >
                      <SentimentDot sentiment={article.sentiment} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-300 leading-snug group-hover:text-white transition-colors">{article.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>{article.source}</span>
                          <span>·</span>
                          <span>{timeAgo(article.publishedAt)}</span>
                          <span>·</span>
                          <span className="text-blue-400">relevance: {article.relevanceScore}%</span>
                        </div>
                      </div>
                      <ExternalLink size={12} className="text-gray-600 group-hover:text-gray-400 flex-shrink-0 mt-0.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
