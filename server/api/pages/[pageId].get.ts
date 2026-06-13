import { and, eq, asc } from 'drizzle-orm'
import { useDb } from '../../utils/db'
import { profiles, pages, blocks, links } from '../../database/schema'
import { assertUserSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const sessionUser = await assertUserSession(event)
  const pageId = getRouterParam(event, 'pageId')!
  const db = useDb()

  // Ownership check via JOIN
  const [page] = await db
    .select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      status: pages.status,
      layoutJson: pages.layoutJson,
      seoJson: pages.seoJson,
      publishedAt: pages.publishedAt,
      updatedAt: pages.updatedAt,
    })
    .from(pages)
    .innerJoin(profiles, eq(pages.profileId, profiles.id))
    .where(and(eq(pages.id, pageId), eq(profiles.userId, sessionUser.id)))
    .limit(1)

  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Halaman tidak ditemukan' })
  }

  const pageBlocks = await db
    .select()
    .from(blocks)
    .where(eq(blocks.pageId, pageId))
    .orderBy(asc(blocks.sortOrder))

  const pageLinks = await db
    .select()
    .from(links)
    .where(eq(links.pageId, pageId))
    .orderBy(asc(links.sortOrder))

  return { ...page, blocks: pageBlocks, links: pageLinks }
})
