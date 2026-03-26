'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Shield,
  TrendingUp,
  Target,
  ArrowRight,
  AlertTriangle,
  BrainCircuit,
  Zap,
} from 'lucide-react'
import { CURATED_THREAT_EVENTS } from '@/lib/curated-scenarios'
import type { ThreatPulse } from '@/lib/types'

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-400 border-green-500/20',
}

export default function DashboardPage() {
  const [liveThreats, setLiveThreats] = useState<ThreatPulse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/threats')
      .then(res => res.json())
      .then(data => setLiveThreats(data.threats?.slice(0, 5) || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Threat-to-demand intelligence overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Shield, label: 'Active Threats', value: loading ? '...' : String(liveThreats.length + CURATED_THREAT_EVENTS.length), color: 'text-red-400', bg: 'bg-red-500/10' },
          { icon: TrendingUp, label: 'Demand Windows', value: '3', color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { icon: Target, label: 'Campaigns Ready', value: String(CURATED_THREAT_EVENTS.length), color: 'text-green-400', bg: 'bg-green-500/10' },
          { icon: Zap, label: 'Est. Pipeline', value: '\u20ac780K+', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How it works */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <BrainCircuit size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">How it works:</span>{' '}
              CyberPulse monitors global threat intelligence feeds, correlates them with real-time search demand data, news velocity, and social signals. When a threat event creates a demand spike in your target market, it generates an actionable campaign brief within hours.
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Featured Scenarios */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-400" />
              Featured Threat Scenarios
            </h2>
            <Link href="/campaigns">
              <Button variant="ghost" size="sm">View all <ArrowRight size={14} /></Button>
            </Link>
          </div>
          <div className="space-y-3">
            {CURATED_THREAT_EVENTS.map(ev => (
              <Link key={ev.id} href={`/campaigns?scenario=${ev.id}`}>
                <Card className="hover:border-red-500/30 transition-colors cursor-pointer mb-3">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={severityColors[ev.severity]}>{ev.severity}</Badge>
                      <span className="text-xs text-muted-foreground">{ev.category}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{ev.daysAgo}d ago</span>
                    </div>
                    <h3 className="text-sm font-semibold mb-1">{ev.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{ev.region}</span>
                      <span>{ev.affectedIndustry}</span>
                      <span className="text-red-400 font-medium ml-auto">{ev.searchSpike.keywords[0].change} spike</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Live Threats */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield size={18} className="text-orange-400" />
              Live Threat Feed
            </h2>
            <Link href="/threats">
              <Button variant="ghost" size="sm">Full feed <ArrowRight size={14} /></Button>
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-40" />
                  </CardContent>
                </Card>
              ))
            ) : liveThreats.length > 0 ? (
              liveThreats.map((threat) => (
                <Card key={threat.id} className="hover:border-orange-500/30 transition-colors cursor-pointer mb-3">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={severityColors[threat.severity] || severityColors.medium}>{threat.severity}</Badge>
                      <span className="text-xs text-muted-foreground">{threat.category}</span>
                    </div>
                    <h3 className="text-sm font-semibold mb-1 line-clamp-2">{threat.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{threat.region}</span>
                      <span>{threat.affectedIndustry}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Shield size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No live threats loaded. Check the full feed.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
