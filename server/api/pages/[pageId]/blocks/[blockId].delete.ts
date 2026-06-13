import { and, eq } from 'drizzle-orm'
import { useDb } from '../../../../utils/db'
import { profiles, pages, blocks } from '../../../../database/schema'
import { assertUserSession } from '../../../../utils/auth'

export default defineEventHandler(async (event) => {
  const sessionUser = await assertUserSession(event)
  const pageId = getRouterParam(event, 'pageId')!
  const blockId = getRouterParam(event, 'blockId')!
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
    .delete(blocks)
    .where(and(eq(blocks.id, blockId), eq(blocks.pageId, pageId)))
    .returning({ id: blocks.id })

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Block tidak ditemukan' })
  }

  return { deleted: deleted.id }
})
