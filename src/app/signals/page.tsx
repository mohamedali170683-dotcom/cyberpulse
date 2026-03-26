'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, RefreshCw, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import type { SearchDemandSignal } from '@/lib/types'

const trendIcons: Record<string, React.ReactNode> = {
  rising: <ArrowUpRight size={14} className="text-red-400" />,
  stable: <Minus size={14} className="text-muted-foreground" />,
  declining: <ArrowDownRight size={14} className="text-green-400" />,
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<SearchDemandSignal[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('loading')

  const fetchSignals = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/search-demand?keywords=ransomware,threat%20intelligence,NIS2,vulnerability,phishing,zero%20trust,incident%20response,cyber%20insurance,OT%20security,Volt%20Typhoon')
      const data = await res.json()
      setSignals(data.signals || [])
      setSource(data.source || 'unknown')
    } catch {
      setSignals([])
      setSource('error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSignals() }, [])

  const sorted = [...signals].sort((a, b) => b.changePercent - a.changePercent)
  const trending = sorted.filter(s => s.changePercent > 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Demand Signals</h1>
          <p className="text-muted-foreground text-sm mt-1">Search demand correlation across cybersecurity keywords</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">{source}</Badge>
          <Button variant="outline" size="sm" onClick={fetchSignals} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Trending */}
      {trending.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
            <TrendingUp size={16} /> Trending (&gt;100% spike)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trending.map((signal, i) => (
              <Card key={i} className="border-red-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold truncate max-w-[180px]">{signal.keyword}</span>
                    <Badge className="bg-red-500/10 text-red-400">+{signal.changePercent}%</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="font-mono">{signal.previousVolume}</span>
                    <span>\u2192</span>
                    <span className="font-mono font-bold text-foreground">{signal.currentVolume}</span>
                    {trendIcons[signal.trend]}
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (signal.changePercent / (sorted[0]?.changePercent || 1)) * 100)}%` }}
                    />
                  </div>
                  {signal.relatedQueries.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {signal.relatedQueries.slice(0, 3).map((q, j) => (
                        <Badge key={j} variant="secondary" className="text-[10px]">{q}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Signals Table */}
      <div>
        <h2 className="text-sm font-semibold mb-3">All Keywords</h2>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-xs text-muted-foreground font-medium">Keyword</th>
                      <th className="text-right p-3 text-xs text-muted-foreground font-medium">Previous</th>
                      <th className="text-right p-3 text-xs text-muted-foreground font-medium">Current</th>
                      <th className="text-right p-3 text-xs text-muted-foreground font-medium">Change</th>
                      <th className="text-center p-3 text-xs text-muted-foreground font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((signal, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                        <td className="p-3 font-medium">{signal.keyword}</td>
                        <td className="p-3 text-right font-mono text-muted-foreground">{signal.previousVolume.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-bold">{signal.currentVolume.toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <Badge className={signal.changePercent > 200 ? 'bg-red-500/10 text-red-400' : signal.changePercent > 100 ? 'bg-orange-500/10 text-orange-400' : 'bg-zinc-500/10 text-muted-foreground'}>
                            +{signal.changePercent}%
                          </Badge>
                        </td>
                        <td className="p-3 text-center">{trendIcons[signal.trend]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
