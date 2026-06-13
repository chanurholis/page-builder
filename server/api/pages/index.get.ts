import { eq } from 'drizzle-orm'
import { useDb } from '../../utils/db'
import { profiles, pages } from '../../database/schema'
import { assertUserSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const sessionUser = await assertUserSession(event)
  const db = useDb()

  // Ambil profile milik user
  const [profile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, sessionUser.id))
    .limit(1)

  if (!profile) {
    return []
  }

  const result = await db
    .select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      status: pages.status,
      publishedAt: pages.publishedAt,
      updatedAt: pages.updatedAt,
    })
    .from(pages)
    .where(eq(pages.profileId, profile.id))
    .orderBy(pages.updatedAt)

  return result
})
