'use client'

import { useState, useCallback } from 'react'
import type { ThreatPulse, SearchDemandSignal, NewsSignal, CampaignBrief } from '@/lib/types'

interface GenerateCampaignState {
  brief: CampaignBrief | null
  rawText: string
  isGenerating: boolean
  error: string | null
}

export function useGenerateCampaign() {
  const [state, setState] = useState<GenerateCampaignState>({
    brief: null,
    rawText: '',
    isGenerating: false,
    error: null,
  })

  const generate = useCallback(async (
    threat: ThreatPulse,
    searchSignals: SearchDemandSignal[],
    newsSignals: NewsSignal[]
  ) => {
    setState({ brief: null, rawText: '', isGenerating: true, error: null })

    try {
      const response = await fetch('/api/campaigns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threat, searchSignals, newsSignals }),
      })

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setState(prev => ({ ...prev, rawText: fullText }))
      }

      // Parse the complete JSON response
      try {
        const brief = JSON.parse(fullText.trim()) as CampaignBrief
        setState({ brief, rawText: fullText, isGenerating: false, error: null })
        return brief
      } catch {
        // If JSON parsing fails, keep the raw text
        setState(prev => ({ ...prev, isGenerating: false, error: 'Failed to parse campaign brief — raw text available' }))
        return null
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({ ...prev, isGenerating: false, error: message }))
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState({ brief: null, rawText: '', isGenerating: false, error: null })
  }, [])

  return { ...state, generate, reset }
}
