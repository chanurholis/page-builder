import { and, eq } from 'drizzle-orm'
import { useDb } from '../../../../utils/db'
import { profiles, pages, links } from '../../../../database/schema'
import { assertUserSession } from '../../../../utils/auth'
import { updateLinkSchema } from '../../../../utils/validation'

export default defineEventHandler(async (event) => {
  const sessionUser = await assertUserSession(event)
  const pageId = getRouterParam(event, 'pageId')!
  const linkId = getRouterParam(event, 'linkId')!
  const body = await readBody(event)

  const parsed = updateLinkSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation Error',
      data: parsed.error.flatten().fieldErrors,
    })
  }

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

  const [updated] = await db
    .update(links)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(links.id, linkId), eq(links.pageId, pageId)))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Link tidak ditemukan' })
  }

  return updated
})
