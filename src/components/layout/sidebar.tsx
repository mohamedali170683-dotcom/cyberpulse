'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Shield,
  Target,
  TrendingUp,
  Settings,
  Zap,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/threats', label: 'Threat Feed', icon: Shield },
  { href: '/campaigns', label: 'Campaigns', icon: Target },
  { href: '/signals', label: 'Demand Signals', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
          <Zap size={20} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight">CyberPulse</h1>
          <p className="text-[10px] text-muted-foreground">Threat-to-Demand Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          CyberPulse v0.2.0
        </p>
      </div>
    </aside>
  )
}
