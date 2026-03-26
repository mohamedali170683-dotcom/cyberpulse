'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Radio,
  Activity,
  Menu,
  X,
  Zap,
  LayoutDashboard,
  Shield,
  Target,
  TrendingUp,
  Settings,
} from 'lucide-react'

const mobileNav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/threats', label: 'Threats', icon: Shield },
  { href: '/campaigns', label: 'Campaigns', icon: Target },
  { href: '/signals', label: 'Signals', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Mobile menu button + logo */}
        <div className="flex items-center gap-3 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-red-400" />
            <span className="font-bold text-sm">CyberPulse</span>
          </div>
        </div>

        {/* Status indicators */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Radio size={11} className="text-red-400 animate-pulse" />
            Monitoring 2,400+ feeds
          </span>
          <span className="flex items-center gap-1.5">
            <Activity size={11} className="text-green-400" />
            3 active windows
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground border border-border font-mono">
            DACH + EU
          </span>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-card p-3 space-y-1">
          {mobileNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
