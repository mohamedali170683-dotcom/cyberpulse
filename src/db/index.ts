import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

function getDb() {
  const databaseUrl = process.env.POSTGRES_URL
  if (!databaseUrl) {
    return null
  }
  const sql = neon(databaseUrl)
  return drizzle(sql, { schema })
}

// Lazy singleton — only connects when POSTGRES_URL is set
let _db: ReturnType<typeof getDb> | undefined

export function db() {
  if (_db === undefined) {
    _db = getDb()
  }
  return _db
}

export type Database = NonNullable<ReturnType<typeof getDb>>
