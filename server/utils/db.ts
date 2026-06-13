import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '../database/schema'

let _db: ReturnType<typeof drizzle> | null = null

export function useDb() {
  if (_db) return _db

  const config = useRuntimeConfig()
  const url = config.databaseUrl

  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }

  const pool = new Pool({
    connectionString: url,
    max: 10,
  })

  _db = drizzle(pool, { schema })
  return _db
}
