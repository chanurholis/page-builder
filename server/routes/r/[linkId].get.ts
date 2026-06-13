import { eq } from 'drizzle-orm'
import { useDb } from '../../utils/db'
import { links, profiles, pages, linkClicks } from '../../database/schema'
import { parseUtmFromQuery, getUserAgent, getReferrerFromHeader } from '../../utils/tracking'

export default defineEventHandler(async (event) => {
  const linkId = getRouterParam(event, 'linkId')!
  const query = getQuery(event) as Record<string, string>
  const db = useDb()

  // Resolve link
  const [link] = await db
    .select({
      id: links.id,
      url: links.url,
      pageId: links.pageId,
      isActive: links.isActive,
    })
    .from(links)
    .where(eq(links.id, linkId))
    .limit(1)

  if (!link || !link.isActive) {
    throw createError({ statusCode: 404, statusMessage: 'Link tidak ditemukan' })
  }

  // Validasi URL target sebelum redirect
  let targetUrl: URL
  try {
    targetUrl = new URL(link.url)
    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      throw new Error('invalid protocol')
    }
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'URL tidak valid' })
  }

  // Ambil profile untuk denormalized username
  const [page] = await db
    .select({ profileId: pages.profileId })
    .from(pages)
    .where(eq(pages.id, link.pageId))
    .limit(1)

  let profileUsername = ''
  let profileId: string | null = null

  if (page) {
    const [profile] = await db
      .select({ id: profiles.id, username: profiles.username })
      .from(profiles)
      .where(eq(profiles.id, page.profileId))
      .limit(1)

    if (profile) {
      profileUsername = profile.username
      profileId = profile.id
    }
  }

  // Catat klik — jangan blok redirect jika gagal
  const utm = parseUtmFromQuery(query)
  const userAgent = getUserAgent(event)
  const referrer = getReferrerFromHeader(event)

  try {
    await db.insert(linkClicks).values({
      linkId: link.id,
      profileId,
      pageId: link.pageId,
      profileUsername,
      targetUrl: link.url,
      referrer,
      userAgent,
      ...utm,
    })
  } catch (err) {
    console.error('[click tracking] insert failed:', err)
  }

  // Redirect ke target
  return sendRedirect(event, targetUrl.toString(), 302)
})
