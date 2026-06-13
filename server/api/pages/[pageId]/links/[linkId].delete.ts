import { and, eq } from 'drizzle-orm'
import { useDb } from '../../../../utils/db'
import { profiles, pages, links } from '../../../../database/schema'
import { assertUserSession } from '../../../../utils/auth'

export default defineEventHandler(async (event) => {
  const sessionUser = await assertUserSession(event)
  const pageId = getRouterParam(event, 'pageId')!
  const linkId = getRouterParam(event, 'linkId')!
  const db = useDb()

  const [page] = await db
    .select({ id: pages.id })
    .from(pages)
    .innerJoin(profiles, eq(pages.profileId, profiles.id))
    .where(and(eq(pages.id, pageId), eq(profiles.userId, sessionUser.id)))
    .limit(1)

  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Halaman tidak ditemukan' })
  }

  const [deleted] = await db
    .delete(links)
    .where(and(eq(links.id, linkId), eq(links.pageId, pageId)))
    .returning({ id: links.id })

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Link tidak ditemukan' })
  }

  return { deleted: deleted.id }
})
