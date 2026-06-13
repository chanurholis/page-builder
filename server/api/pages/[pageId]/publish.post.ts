import { and, eq } from 'drizzle-orm'
import { useDb } from '../../../utils/db'
import { profiles, pages } from '../../../database/schema'
import { assertUserSession } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const sessionUser = await assertUserSession(event)
  const pageId = getRouterParam(event, 'pageId')!
  const db = useDb()

  const [existing] = await db
    .select({ id: pages.id, status: pages.status })
    .from(pages)
    .innerJoin(profiles, eq(pages.profileId, profiles.id))
    .where(and(eq(pages.id, pageId), eq(profiles.userId, sessionUser.id)))
    .limit(1)

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Halaman tidak ditemukan' })
  }

  const now = new Date()
  const [updated] = await db
    .update(pages)
    .set({
      status: 'published',
      publishedAt: existing.status === 'published' ? undefined : now,
      updatedAt: now,
    })
    .where(eq(pages.id, pageId))
    .returning({ id: pages.id, status: pages.status, publishedAt: pages.publishedAt })

  return updated
})
