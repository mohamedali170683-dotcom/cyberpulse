'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Shield,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  Globe,
  Clock,
  Newspaper,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react'
import type { ThreatPulse, SearchDemandSignal, NewsSignal } from '@/lib/types'
import { useGenerateCampaign } from '@/hooks/useGenerateCampaign'

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-400 border-green-500/20',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function ThreatsPage() {
  const [threats, setThreats] = useState<ThreatPulse[]>([])
  const [selected, setSelected] = useState<ThreatPulse | null>(null)
  const [searchSignals, setSearchSignals] = useState<SearchDemandSignal[]>([])
  const [newsSignals, setNewsSignals] = useState<NewsSignal[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string>('signals')
  const [source, setSource] = useState('loading')

  const campaign = useGenerateCampaign()

  const fetchThreats = useCallback(async () => {
    try {
      const res = await fetch('/api/threats')
      const data = await res.json()
      setThreats(data.threats || [])
      setSource(data.source || 'unknown')
    } catch {
      setThreats([])
      setSource('error')
    }
  }, [])

  useEffect(() => {
    fetchThreats().finally(() => setLoading(false))
  }, [fetchThreats])

  const refresh = async () => {
    setRefreshing(true)
    await fetchThreats()
    setRefreshing(false)
  }

  const selectThreat = async (threat: ThreatPulse) => {
    setSelected(threat)
    campaign.reset()

    const tags = threat.tags.join(',')
    const [signalsRes, newsRes] = await Promise.all([
      fetch(`/api/search-demand?tags=${encodeURIComponent(tags)}`).then(r => r.json()).catch(() => ({ signals: [] })),
      fetch(`/api/news?keywords=${encodeURIComponent(tags)}`).then(r => r.json()).catch(() => ({ articles: [] })),
    ])
    setSearchSignals(signalsRes.signals || [])
    setNewsSignals(newsRes.articles || [])
  }

  const toggleSection = (s: string) => setExpandedSection(expandedSection === s ? '' : s)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Threat Feed</h1>
          <p className="text-muted-foreground text-sm mt-1">Live threat intelligence from AlienVault OTX</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">{source}</Badge>
          <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Threat list */}
        <div className="col-span-12 lg:col-span-4">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-2 pr-2">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-full" /><Skeleton className="h-3 w-32" /></CardContent></Card>
                ))
              ) : threats.length > 0 ? (
                threats.map((threat) => (
                  <Card
                    key={threat.id}
                    className={`cursor-pointer transition-colors ${selected?.id === threat.id ? 'border-red-500/50 bg-red-500/5' : 'hover:border-muted-foreground/20'}`}
                    onClick={() => selectThreat(threat)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge className={`text-[10px] ${severityColors[threat.severity] || severityColors.medium}`}>{threat.severity}</Badge>
                        <span className="text-[10px] text-muted-foreground">{threat.category}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(threat.publishedAt)}</span>
                      </div>
                      <h3 className="text-xs font-semibold line-clamp-2 mb-1">{threat.title}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Globe size={10} /> {threat.region}
                        <Shield size={10} className="ml-1" /> {threat.affectedIndustry}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Shield size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No threats available</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right: Detail panel */}
        <div className="col-span-12 lg:col-span-8">
          {!selected ? (
            <Card className="h-[calc(100vh-200px)] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Shield size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">Select a threat</p>
                <p className="text-sm">to view details and generate a campaign brief</p>
              </div>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-4 pr-2">
                {/* Threat detail */}
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={severityColors[selected.severity]}>{selected.severity}</Badge>
                      <span className="text-xs text-muted-foreground">{selected.category}</span>
                      {selected.url && (
                        <a href={selected.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-blue-400 hover:underline flex items-center gap-1">
                          Source <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                    <h2 className="text-lg font-bold mb-2">{selected.title}</h2>
                    <p className="text-sm text-muted-foreground mb-3">{selected.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.tags.slice(0, 8).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                    {selected.cves.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {selected.cves.map((cve) => (
                          <Badge key={cve} variant="outline" className="text-[10px] font-mono text-red-400">{cve}</Badge>
                        ))}
                      </div>
                    )}
                    <Separator className="my-4" />
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Globe size={12} /> {selected.region}</span>
                      <span className="flex items-center gap-1"><Shield size={12} /> {selected.affectedIndustry}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {timeAgo(selected.publishedAt)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Search Signals */}
                <Card>
                  <button onClick={() => toggleSection('signals')} className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors rounded-t-lg">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <TrendingUp size={16} className="text-red-400" /> Search Demand Correlation
                      {searchSignals.length > 0 && <Badge variant="secondary" className="text-[10px]">{searchSignals.length} signals</Badge>}
                    </span>
                    {expandedSection === 'signals' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {expandedSection === 'signals' && (
                    <CardContent className="pt-0">
                      {searchSignals.length > 0 ? (
                        <div className="space-y-2">
                          {searchSignals.map((signal, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                              <span className="text-xs text-muted-foreground truncate max-w-[200px]">{signal.keyword}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground font-mono">{signal.previousVolume}</span>
                                <span className="text-xs text-muted-foreground">\u2192</span>
                                <span className="text-xs font-bold font-mono">{signal.currentVolume}</span>
                                <Badge className={signal.changePercent > 200 ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'}>
                                  +{signal.changePercent}%
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground py-2">No search signals found for this threat</p>
                      )}
                    </CardContent>
                  )}
                </Card>

                {/* News */}
                <Card>
                  <button onClick={() => toggleSection('news')} className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors rounded-t-lg">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <Newspaper size={16} className="text-blue-400" /> News Coverage
                      {newsSignals.length > 0 && <Badge variant="secondary" className="text-[10px]">{newsSignals.length} articles</Badge>}
                    </span>
                    {expandedSection === 'news' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {expandedSection === 'news' && (
                    <CardContent className="pt-0">
                      {newsSignals.length > 0 ? (
                        <div className="space-y-2">
                          {newsSignals.slice(0, 8).map((article, i) => (
                            <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="block p-2 rounded hover:bg-accent/50 transition-colors">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-[10px]">{article.source}</Badge>
                                <Badge className={article.sentiment === 'negative' ? 'bg-red-500/10 text-red-400' : article.sentiment === 'positive' ? 'bg-green-500/10 text-green-400' : 'bg-zinc-500/10 text-zinc-400'}>
                                  {article.sentiment}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground ml-auto">relevance: {article.relevanceScore}</span>
                              </div>
                              <p className="text-xs line-clamp-1">{article.title}</p>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground py-2">No news articles found</p>
                      )}
                    </CardContent>
                  )}
                </Card>

                {/* Generate Campaign Brief */}
                <Card className="border-green-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Sparkles size={16} className="text-green-400" />
                        AI Campaign Brief
                      </h3>
                      <Button
                        size="sm"
                        onClick={() => campaign.generate(selected, searchSignals, newsSignals)}
                        disabled={campaign.isGenerating}
                      >
                        {campaign.isGenerating ? 'Generating...' : 'Generate Brief'}
                      </Button>
                    </div>

                    {campaign.isGenerating && (
                      <div className="p-4 rounded-lg bg-muted/50">
                        <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">{campaign.rawText || 'Starting generation...'}</pre>
                      </div>
                    )}

                    {campaign.brief && (
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                          <p className="text-xs font-medium text-red-400">Demand Window: {campaign.brief.demandWindow}</p>
                          <p className="text-[10px] text-muted-foreground">Decay: {campaign.brief.decayRate}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded bg-muted/30">
                            <p className="text-[10px] text-muted-foreground">Primary Audience</p>
                            <p className="text-xs">{campaign.brief.audiencePrimary}</p>
                          </div>
                          <div className="p-2 rounded bg-muted/30">
                            <p className="text-[10px] text-muted-foreground">Addressable</p>
                            <p className="text-xs">{campaign.brief.audienceSize}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {[
                            { label: 'HOOK', text: campaign.brief.messagingHook, color: 'text-red-400' },
                            { label: 'VALUE', text: campaign.brief.messagingValue, color: 'text-blue-400' },
                            { label: 'CTA', text: campaign.brief.messagingCta, color: 'text-green-400' },
                          ].map((m) => (
                            <div key={m.label} className="p-2 rounded bg-muted/30">
                              <span className={`text-[10px] font-bold ${m.color}`}>{m.label}: </span>
                              <span className="text-xs">{m.text}</span>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                          <p className="text-sm font-bold text-green-400">{campaign.brief.expectedPipeline}</p>
                          <p className="text-[10px] text-muted-foreground">estimated influenced pipeline</p>
                        </div>
                      </div>
                    )}

                    {campaign.error && !campaign.brief && (
                      <p className="text-xs text-red-400">{campaign.error}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  )
}
