import { and, eq } from 'drizzle-orm'
import { useDb } from '../../../utils/db'
import { profiles, pages, blocks } from '../../../database/schema'
import { assertUserSession } from '../../../utils/auth'
import { createBlockSchema } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const sessionUser = await assertUserSession(event)
  const pageId = getRouterParam(event, 'pageId')!
  const body = await readBody(event)

  const parsed = createBlockSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation Error',
      data: parsed.error.flatten().fieldErrors,
    })
  }

  const db = useDb()

  // Ownership check
  const [page] = await db
    .select({ id: pages.id })
    .from(pages)
    .innerJoin(profiles, eq(pages.profileId, profiles.id))
    .where(and(eq(pages.id, pageId), eq(profiles.userId, sessionUser.id)))
    .limit(1)

  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Halaman tidak ditemukan' })
  }

  const [block] = await db
    .insert(blocks)
    .values({ ...parsed.data, pageId })
    .returning()

  setResponseStatus(event, 201)
  return block
})
