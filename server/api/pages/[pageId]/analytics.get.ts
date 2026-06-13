import { and, eq, desc, count, sql } from 'drizzle-orm'
import { useDb } from '../../../utils/db'
import { profiles, pages, links, pageVisits, linkClicks } from '../../../database/schema'
import { assertUserSession } from '../../../utils/auth'
import type { AnalyticsSummary } from '../../../../shared/types/analytics'

export default defineEventHandler(async (event) => {
  const sessionUser = await assertUserSession(event)
  const pageId = getRouterParam(event, 'pageId')!
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

  // Total visits
  const [visitsRow] = await db
    .select({ total: count() })
    .from(pageVisits)
    .where(eq(pageVisits.pageId, pageId))

  const totalVisits = Number(visitsRow?.total ?? 0)

  // Total clicks
  const [clicksRow] = await db
    .select({ total: count() })
    .from(linkClicks)
    .where(eq(linkClicks.pageId, pageId))

  const totalClicks = Number(clicksRow?.total ?? 0)

  const ctr = totalVisits > 0 ? totalClicks / totalVisits : 0

  // Clicks per link
  const clicksPerLink = await db
    .select({
      linkId: links.id,
      label: links.label,
      clicks: count(linkClicks.id),
    })
    .from(links)
    .leftJoin(linkClicks, eq(linkClicks.linkId, links.id))
    .where(eq(links.pageId, pageId))
    .groupBy(links.id, links.label)
    .orderBy(desc(count(linkClicks.id)))

  // Recent visits (50 terakhir)
  const recentVisits = await db
    .select({
      id: pageVisits.id,
      timestamp: pageVisits.timestamp,
      referrer: pageVisits.referrer,
      utmSource: pageVisits.utmSource,
      utmMedium: pageVisits.utmMedium,
      utmCampaign: pageVisits.utmCampaign,
    })
    .from(pageVisits)
    .where(eq(pageVisits.pageId, pageId))
    .orderBy(desc(pageVisits.timestamp))
    .limit(50)

  const response: AnalyticsSummary = {
    totalVisits,
    totalClicks,
    ctr,
    clicksPerLink: clicksPerLink.map((r) => ({
      linkId: r.linkId,
      label: r.label,
      clicks: Number(r.clicks),
    })),
    recentVisits: recentVisits.map((r) => ({
      id: Number(r.id),
      timestamp: r.timestamp.toISOString(),
      referrer: r.referrer,
      utmSource: r.utmSource,
      utmMedium: r.utmMedium,
      utmCampaign: r.utmCampaign,
    })),
  }

  return response
})
