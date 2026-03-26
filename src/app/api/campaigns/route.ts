import { NextResponse } from 'next/server'
import { createCampaign, getCampaigns, getCampaignsByThreatId } from '@/db/queries'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const threatId = url.searchParams.get('threatId')

    const data = threatId
      ? await getCampaignsByThreatId(threatId)
      : await getCampaigns()

    return NextResponse.json({
      campaigns: data,
      source: data.length > 0 ? 'database' : 'empty',
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Campaigns fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns', code: 'FETCH_ERROR' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { threatId, title, brief, generatedBy } = body

    if (!threatId || !title || !brief) {
      return NextResponse.json(
        { error: 'Missing required fields: threatId, title, brief', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const campaign = await createCampaign({
      threatId,
      title,
      brief,
      generatedBy: generatedBy || 'ai',
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Database not configured — campaign not saved', code: 'NO_DATABASE' },
        { status: 503 }
      )
    }

    return NextResponse.json({ campaign, source: 'database' }, { status: 201 })
  } catch (error) {
    console.error('Campaign save error:', error)
    return NextResponse.json(
      { error: 'Failed to save campaign', code: 'SAVE_ERROR' },
      { status: 500 }
    )
  }
}
