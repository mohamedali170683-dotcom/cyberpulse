'use client'

import { useState } from 'react'
import CyberPulse from '@/components/CyberPulse'
import LiveFeed from '@/components/LiveFeed'
import { Zap, Radio, Target, Activity, BrainCircuit } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'live'>('scenarios')

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
                <Zap size={22} className="text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">CyberPulse</h1>
                <p className="text-xs text-gray-500">Threat-to-Demand Intelligence Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Radio size={11} className="text-red-400 animate-pulse" /> Monitoring 2,400+ threat feeds
              </span>
              <span className="flex items-center gap-1.5">
                <Activity size={11} className="text-green-400" /> 3 active demand windows
              </span>
              <span className="px-2 py-1 rounded-md bg-gray-800 text-gray-400 border border-gray-700">DACH + EU</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* How it works */}
        <div className="mb-6 p-4 rounded-xl bg-gray-900 border border-gray-800">
          <div className="flex items-start gap-3">
            <BrainCircuit size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-400">
              <span className="text-white font-medium">How it works:</span> CyberPulse monitors global threat intelligence feeds, correlates them with real-time search demand data, news velocity, and social signals. When a threat event creates a demand spike in your target market, it generates an actionable campaign brief within hours — turning threat events into qualified pipeline.
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-gray-900 rounded-xl border border-gray-800 w-fit">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'scenarios'
                ? 'bg-gray-800 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Target size={14} />
            Campaign Scenarios
            <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">3 ready</span>
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'live'
                ? 'bg-gray-800 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Radio size={14} className={activeTab === 'live' ? 'animate-pulse' : ''} />
            Live Feed
            <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">real-time</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'scenarios' ? <CyberPulse embedded /> : <LiveFeed />}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-600">
            CyberPulse — Threat-to-Demand Intelligence Engine — Concept by Mohamed Ali Mohamed
          </p>
          <p className="text-xs text-gray-700 mt-1">
            Connects threat intelligence + demand prediction + geopolitical analysis → actionable marketing pipeline
          </p>
        </div>
      </div>
    </div>
  )
}
