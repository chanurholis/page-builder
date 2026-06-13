import { eq } from 'drizzle-orm'
import { useDb } from '../utils/db'
import { profiles } from '../database/schema'
import { assertUserSession } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const sessionUser = await assertUserSession(event)
  const db = useDb()

  const [profile] = await db
    .select({
      username: profiles.username,
      displayName: profiles.displayName,
      bio: profiles.bio,
      avatarUrl: profiles.avatarUrl,
    })
    .from(profiles)
    .where(eq(profiles.userId, sessionUser.id))
    .limit(1)

  if (!profile) {
    throw createError({ statusCode: 404, statusMessage: 'Profile tidak ditemukan' })
  }

  return {
    id: sessionUser.id,
    email: sessionUser.email,
    profile,
  }
})
