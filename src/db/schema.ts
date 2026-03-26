import { pgTable, uuid, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const threats = pgTable('threats', {
  id: uuid('id').defaultRandom().primaryKey(),
  externalId: text('external_id').unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  severity: text('severity').notNull(), // critical | high | medium | low
  category: text('category').notNull(),
  source: text('source').notNull(),
  publishedAt: timestamp('published_at').notNull(),
  tags: text('tags').array().notNull().default([]),
  cves: text('cves').array().notNull().default([]),
  region: text('region').notNull(),
  affectedIndustry: text('affected_industry').notNull(),
  url: text('url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const searchSignals = pgTable('search_signals', {
  id: uuid('id').defaultRandom().primaryKey(),
  threatId: uuid('threat_id').references(() => threats.id),
  keyword: text('keyword').notNull(),
  currentVolume: integer('current_volume').notNull(),
  previousVolume: integer('previous_volume').notNull(),
  changePercent: integer('change_percent').notNull(),
  trend: text('trend').notNull(), // rising | stable | declining
  relatedQueries: text('related_queries').array().notNull().default([]),
  source: text('source').notNull(), // curated-model | external
  capturedAt: timestamp('captured_at').defaultNow().notNull(),
})

export const newsSignals = pgTable('news_signals', {
  id: uuid('id').defaultRandom().primaryKey(),
  threatId: uuid('threat_id').references(() => threats.id),
  title: text('title').notNull(),
  source: text('source').notNull(),
  publishedAt: timestamp('published_at').notNull(),
  url: text('url').notNull().unique(),
  sentiment: text('sentiment').notNull(), // negative | neutral | positive
  relevanceScore: integer('relevance_score').notNull(),
  capturedAt: timestamp('captured_at').defaultNow().notNull(),
})

export const campaigns = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  threatId: uuid('threat_id').references(() => threats.id),
  title: text('title').notNull(),
  status: text('status').notNull().default('draft'), // draft | active | completed
  brief: jsonb('brief').notNull(), // CampaignBrief JSON
  generatedBy: text('generated_by').notNull(), // ai | curated
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
