import { eq, desc, sql } from 'drizzle-orm'
import { db } from './index'
import { threats, searchSignals, newsSignals, campaigns } from './schema'
import type { ThreatPulse, SearchDemandSignal, NewsSignal, CampaignBrief } from '@/lib/types'

// ─── Threats ────────────────────────────────────────────────────

export async function upsertThreats(threatList: ThreatPulse[]) {
  const database = db()
  if (!database) return []

  const results = []
  for (const t of threatList) {
    const [row] = await database
      .insert(threats)
      .values({
        externalId: t.id,
        title: t.title,
        description: t.description,
        severity: t.severity,
        category: t.category,
        source: t.source,
        publishedAt: new Date(t.publishedAt),
        tags: t.tags,
        cves: t.cves,
        region: t.region,
        affectedIndustry: t.affectedIndustry,
        url: t.url ?? null,
      })
      .onConflictDoUpdate({
        target: threats.externalId,
        set: {
          title: t.title,
          description: t.description,
          severity: t.severity,
          tags: t.tags,
          cves: t.cves,
          updatedAt: new Date(),
        },
      })
      .returning()
    results.push(row)
  }
  return results
}

export async function getRecentThreats(limit = 50) {
  const database = db()
  if (!database) return []

  return database
    .select()
    .from(threats)
    .orderBy(desc(threats.publishedAt))
    .limit(limit)
}

export async function getThreatById(id: string) {
  const database = db()
  if (!database) return null

  const [row] = await database.select().from(threats).where(eq(threats.id, id))
  return row ?? null
}

// ─── Search Signals ─────────────────────────────────────────────

export async function insertSearchSignals(signals: (SearchDemandSignal & { threatId?: string; source: string })[]) {
  const database = db()
  if (!database) return

  for (const s of signals) {
    await database.insert(searchSignals).values({
      threatId: s.threatId ?? null,
      keyword: s.keyword,
      currentVolume: s.currentVolume,
      previousVolume: s.previousVolume,
      changePercent: s.changePercent,
      trend: s.trend,
      relatedQueries: s.relatedQueries,
      source: s.source,
    })
  }
}

export async function getSearchSignalHistory(keyword: string, limit = 100) {
  const database = db()
  if (!database) return []

  return database
    .select()
    .from(searchSignals)
    .where(eq(searchSignals.keyword, keyword))
    .orderBy(desc(searchSignals.capturedAt))
    .limit(limit)
}

// ─── News Signals ───────────────────────────────────────────────

export async function upsertNewsSignals(articles: NewsSignal[]) {
  const database = db()
  if (!database) return

  for (const a of articles) {
    await database
      .insert(newsSignals)
      .values({
        title: a.title,
        source: a.source,
        publishedAt: new Date(a.publishedAt),
        url: a.url,
        sentiment: a.sentiment,
        relevanceScore: a.relevanceScore,
      })
      .onConflictDoNothing({ target: newsSignals.url })
  }
}

// ─── Campaigns ──────────────────────────────────────────────────

export async function createCampaign(data: {
  threatId: string
  title: string
  brief: CampaignBrief
  generatedBy: 'ai' | 'curated'
}) {
  const database = db()
  if (!database) return null

  const [row] = await database
    .insert(campaigns)
    .values({
      threatId: data.threatId,
      title: data.title,
      brief: data.brief,
      generatedBy: data.generatedBy,
    })
    .returning()
  return row
}

export async function getCampaigns(limit = 50) {
  const database = db()
  if (!database) return []

  return database
    .select()
    .from(campaigns)
    .orderBy(desc(campaigns.createdAt))
    .limit(limit)
}

export async function getCampaignById(id: string) {
  const database = db()
  if (!database) return null

  const [row] = await database.select().from(campaigns).where(eq(campaigns.id, id))
  return row ?? null
}

export async function getCampaignsByThreatId(threatId: string) {
  const database = db()
  if (!database) return []

  return database
    .select()
    .from(campaigns)
    .where(eq(campaigns.threatId, threatId))
    .orderBy(desc(campaigns.createdAt))
}

// ─── Stats ──────────────────────────────────────────────────────

export async function getDashboardStats() {
  const database = db()
  if (!database) return { totalThreats: 0, totalCampaigns: 0, activeDemandWindows: 0 }

  const [threatCount] = await database.select({ count: sql<number>`count(*)` }).from(threats)
  const [campaignCount] = await database.select({ count: sql<number>`count(*)` }).from(campaigns)
  const [activeSignals] = await database
    .select({ count: sql<number>`count(distinct ${searchSignals.keyword})` })
    .from(searchSignals)
    .where(sql`${searchSignals.changePercent} > 100 AND ${searchSignals.capturedAt} > now() - interval '7 days'`)

  return {
    totalThreats: Number(threatCount?.count ?? 0),
    totalCampaigns: Number(campaignCount?.count ?? 0),
    activeDemandWindows: Number(activeSignals?.count ?? 0),
  }
}
