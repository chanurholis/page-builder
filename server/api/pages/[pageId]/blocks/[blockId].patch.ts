import { and, eq } from 'drizzle-orm'
import { useDb } from '../../../../utils/db'
import { profiles, pages, blocks } from '../../../../database/schema'
import { assertUserSession } from '../../../../utils/auth'
import { updateBlockSchema } from '../../../../utils/validation'

export default defineEventHandler(async (event) => {
  const sessionUser = await assertUserSession(event)
  const pageId = getRouterParam(event, 'pageId')!
  const blockId = getRouterParam(event, 'blockId')!
  const body = await readBody(event)

  const parsed = updateBlockSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation Error',
      data: parsed.error.flatten().fieldErrors,
    })
  }

  const db = useDb()

  // Ownership check via page
  const [page] = await db
    .select({ id: pages.id })
    .from(pages)
    .innerJoin(profiles, eq(pages.profileId, profiles.id))
    .where(and(eq(pages.id, pageId), eq(profiles.userId, sessionUser.id)))
    .limit(1)

  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Halaman tidak ditemukan' })
  }

  const [updated] = await db
    .update(blocks)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(blocks.id, blockId), eq(blocks.pageId, pageId)))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Block tidak ditemukan' })
  }

  return updated
})
