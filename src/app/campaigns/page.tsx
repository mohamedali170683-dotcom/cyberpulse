'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Target,
  Clock,
  Users,
  MessageSquare,
  Layers,
  BarChart3,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { CURATED_THREAT_EVENTS, type CuratedThreatEvent } from '@/lib/curated-scenarios'

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-400 border-green-500/20',
}

export default function CampaignsPage() {
  const [selected, setSelected] = useState<CuratedThreatEvent | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['search', 'campaign']))

  const toggleSection = (s: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <p className="text-muted-foreground text-sm mt-1">Campaign briefs generated from threat events</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Event list */}
        <div className="col-span-12 lg:col-span-4 space-y-2">
          {CURATED_THREAT_EVENTS.map(ev => (
            <Card
              key={ev.id}
              className={`cursor-pointer transition-colors ${selected?.id === ev.id ? 'border-red-500/50 bg-red-500/5' : 'hover:border-muted-foreground/20'}`}
              onClick={() => setSelected(ev)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={severityColors[ev.severity]}>{ev.severity}</Badge>
                  <span className="text-xs text-muted-foreground">{ev.category}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{ev.daysAgo}d ago</span>
                </div>
                <h3 className="text-sm font-semibold mb-1">{ev.title}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{ev.region}</span>
                  <span>{ev.affectedIndustry}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <TrendingUp size={12} className="text-red-400" />
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full" style={{ width: `${Math.min(95, parseInt(ev.searchSpike.keywords[0].change) / 50)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-red-400">{ev.searchSpike.keywords[0].change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right: Campaign Brief */}
        <div className="col-span-12 lg:col-span-8">
          {!selected ? (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Target size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">Select a threat event</p>
                <p className="text-sm">to view the demand analysis and campaign brief</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={severityColors[selected.severity]}>{selected.severity}</Badge>
                    <span className="text-xs text-muted-foreground">{selected.category}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{selected.date}</span>
                  </div>
                  <h2 className="text-lg font-bold mb-2">{selected.title}</h2>
                  <p className="text-sm text-muted-foreground">{selected.summary}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {[
                      { icon: TrendingUp, label: 'Peak spike', value: selected.searchSpike.keywords[0].change, color: 'text-red-400' },
                      { icon: BarChart3, label: 'News volume', value: `${selected.newsVolume.before} \u2192 ${selected.newsVolume.after}`, color: 'text-orange-400' },
                      { icon: Clock, label: 'Demand window', value: selected.searchSpike.peakWindow.split('(')[0], color: 'text-blue-400' },
                      { icon: Target, label: 'Pipeline', value: selected.campaignBrief.expectedPipeline.split(' ')[0], color: 'text-green-400' },
                    ].map(m => (
                      <div key={m.label} className="p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-1.5 mb-1">
                          <m.icon size={12} className={m.color} />
                          <span className="text-[10px] text-muted-foreground">{m.label}</span>
                        </div>
                        <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Search Demand */}
              <Card>
                <button onClick={() => toggleSection('search')} className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                  <span className="flex items-center gap-2 text-sm font-semibold"><TrendingUp size={16} className="text-red-400" /> Search Demand Analysis</span>
                  {expandedSections.has('search') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedSections.has('search') && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {selected.searchSpike.keywords.map((kw, i) => {
                        const max = Math.max(...selected.searchSpike.keywords.map(k => k.after))
                        return (
                          <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{kw.term}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono text-muted-foreground">{kw.before}</span>
                              <ArrowRight size={10} className="text-muted-foreground" />
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 rounded-full" style={{ width: `${(kw.after / max) * 100}%` }} />
                              </div>
                              <span className="text-xs font-bold font-mono">{kw.after}</span>
                              <Badge className="bg-red-500/10 text-red-400 text-[10px]">{kw.change}</Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-3 flex gap-4 text-[10px] text-muted-foreground">
                      <span>Peak: {selected.searchSpike.peakWindow}</span>
                      <span>Decay: {selected.searchSpike.decayRate}</span>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Social & News */}
              <Card>
                <button onClick={() => toggleSection('social')} className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                  <span className="flex items-center gap-2 text-sm font-semibold"><MessageSquare size={16} className="text-blue-400" /> Social & News Signals</span>
                  {expandedSections.has('social') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedSections.has('social') && (
                  <CardContent className="pt-0 space-y-2">
                    {Object.entries(selected.socialSignals).map(([platform, signal]) => (
                      <div key={platform} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase w-14 flex-shrink-0 pt-0.5">{platform}</span>
                        <span className="text-xs">{signal}</span>
                      </div>
                    ))}
                    <div className="p-2 rounded-lg bg-muted/30">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">News: </span>
                      <span className="text-xs">{selected.newsVolume.before} \u2192 {selected.newsVolume.after} articles ({selected.newsVolume.source})</span>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Campaign Brief */}
              <Card className="border-green-500/20">
                <button onClick={() => toggleSection('campaign')} className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Target size={16} className="text-green-400" /> Campaign Brief
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">Ready</Badge>
                  </span>
                  {expandedSections.has('campaign') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedSections.has('campaign') && (
                  <CardContent className="pt-0 space-y-4">
                    {/* Window */}
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                      <span className="text-xs font-semibold text-red-400 flex items-center gap-1"><Clock size={12} /> Demand Window: {selected.campaignBrief.window}</span>
                    </div>

                    {/* Audience */}
                    <div>
                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1"><Users size={10} /> Target Audience</h4>
                      <div className="space-y-1">
                        <div className="p-2 rounded bg-muted/30">
                          <span className="text-[10px] text-blue-400 font-medium">PRIMARY: </span>
                          <span className="text-xs">{selected.campaignBrief.audience.primary}</span>
                        </div>
                        <div className="p-2 rounded bg-muted/30">
                          <span className="text-[10px] text-muted-foreground font-medium">SECONDARY: </span>
                          <span className="text-xs">{selected.campaignBrief.audience.secondary}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Addressable: {selected.campaignBrief.audience.size}</p>
                      </div>
                    </div>

                    {/* Messaging */}
                    <div>
                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1"><MessageSquare size={10} /> Messaging Framework</h4>
                      <div className="space-y-1">
                        {[
                          { label: 'HOOK', text: selected.campaignBrief.messaging.hook, color: 'text-red-400' },
                          { label: 'VALUE', text: selected.campaignBrief.messaging.value, color: 'text-blue-400' },
                          { label: 'CTA', text: selected.campaignBrief.messaging.cta, color: 'text-green-400' },
                          { label: 'COMPLIANCE', text: selected.campaignBrief.messaging.compliance, color: 'text-orange-400' },
                        ].map(m => (
                          <div key={m.label} className="p-2 rounded bg-muted/30">
                            <span className={`text-[10px] font-bold ${m.color}`}>{m.label}: </span>
                            <span className="text-xs">{m.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Channels */}
                    <div>
                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1"><Layers size={10} /> Channel Execution</h4>
                      <div className="space-y-2">
                        {selected.campaignBrief.channels.map((ch, i) => (
                          <div key={i} className="p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold">{ch.channel}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[10px]">{ch.budget}</Badge>
                                <span className="text-xs font-bold text-green-400">{ch.expectedLeads}</span>
                              </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground">{ch.action}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">CPL: {ch.cpl}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* KPIs */}
                    <div>
                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1"><BarChart3 size={10} /> KPIs</h4>
                      <div className="grid grid-cols-2 gap-1">
                        {selected.campaignBrief.kpis.map((kpi, i) => (
                          <div key={i} className="flex items-center gap-1.5 p-1.5 rounded bg-muted/30 text-[10px]">
                            <div className="w-1 h-1 rounded-full bg-green-500 flex-shrink-0" />
                            {kpi}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Pipeline */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Estimated Influenced Pipeline</p>
                          <p className="text-xl font-bold text-green-400">{selected.campaignBrief.expectedPipeline}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">From a single threat event</p>
                          <p className="text-xs text-muted-foreground">Repeatable. Scalable. Measurable.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
