import { streamText } from 'ai'
import { NextResponse } from 'next/server'
import { CAMPAIGN_BRIEF_SYSTEM_PROMPT, buildCampaignPrompt } from '@/lib/prompts'

export async function POST(request: Request) {
  try {
    const { threat, searchSignals = [], newsSignals = [] } = await request.json()

    if (!threat) {
      return NextResponse.json({ error: 'Threat data is required', code: 'MISSING_THREAT' }, { status: 400 })
    }

    const prompt = buildCampaignPrompt(threat, searchSignals, newsSignals)

    const result = streamText({
      model: 'anthropic/claude-sonnet-4.6' as any,
      system: CAMPAIGN_BRIEF_SYSTEM_PROMPT,
      prompt,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Campaign generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate campaign brief', code: 'GENERATION_ERROR' },
      { status: 500 }
    )
  }
}
