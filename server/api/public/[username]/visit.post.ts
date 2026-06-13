import { eq } from 'drizzle-orm'
import { useDb } from '../../../utils/db'
import { profiles, pages, pageVisits } from '../../../database/schema'
import { visitPayloadSchema } from '../../../utils/validation'
import { getUserAgent, getReferrerFromHeader } from '../../../utils/tracking'

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')!.toLowerCase()
  const body = await readBody(event).catch(() => ({}))
  const parsed = visitPayloadSchema.safeParse(body)

  // Validasi gagal → abaikan saja, jangan blok user
  const payload = parsed.success ? parsed.data : {}

  const db = useDb()

  const [profile] = await db
    .select({ id: profiles.id, username: profiles.username })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1)

  if (!profile) {
    // Username tidak ada → return 204, jangan expose info
    setResponseStatus(event, 204)
    return null
  }

  const [page] = await db
    .select({ id: pages.id })
    .from(pages)
    .where(eq(pages.profileId, profile.id))
    .limit(1)

  const userAgent = getUserAgent(event)
  const headerReferrer = getReferrerFromHeader(event)

  try {
    await db.insert(pageVisits).values({
      profileId: profile.id,
      pageId: page?.id ?? null,
      profileUsername: profile.username,
      referrer: payload.referrer ?? headerReferrer,
      userAgent,
      utmSource: payload.utmSource,
      utmMedium: payload.utmMedium,
      utmCampaign: payload.utmCampaign,
      utmTerm: payload.utmTerm,
      utmContent: payload.utmContent,
      utmJson: payload.utmJson,
    })
  } catch (err) {
    // Log server-side, jangan propagate ke client
    console.error('[visit tracking] insert failed:', err)
  }

  setResponseStatus(event, 204)
  return null
})
