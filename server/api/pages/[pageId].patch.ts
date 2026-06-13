import { and, eq } from 'drizzle-orm'
import { useDb } from '../../utils/db'
import { profiles, pages } from '../../database/schema'
import { assertUserSession } from '../../utils/auth'
import { updatePageSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const sessionUser = await assertUserSession(event)
  const pageId = getRouterParam(event, 'pageId')!
  const body = await readBody(event)

  const parsed = updatePageSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation Error',
      data: parsed.error.flatten().fieldErrors,
    })
  }

  const db = useDb()

  // Ownership check
  const [existing] = await db
    .select({ id: pages.id })
    .from(pages)
    .innerJoin(profiles, eq(pages.profileId, profiles.id))
    .where(and(eq(pages.id, pageId), eq(profiles.userId, sessionUser.id)))
    .limit(1)

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Halaman tidak ditemukan' })
  }

  const [updated] = await db
    .update(pages)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(pages.id, pageId))
    .returning()

  return updated
})
