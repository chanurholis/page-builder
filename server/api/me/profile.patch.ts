import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb } from '../../utils/db'
import { profiles } from '../../database/schema'
import { assertUserSession } from '../../utils/auth'

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(60).trim().optional(),
  bio: z.string().max(200).trim().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
})

export default defineEventHandler(async (event) => {
  const sessionUser = await assertUserSession(event)
  const body = await readBody(event)

  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation Error',
      data: parsed.error.flatten().fieldErrors,
    })
  }

  const db = useDb()

  const [updated] = await db
    .update(profiles)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(profiles.userId, sessionUser.id))
    .returning({
      username: profiles.username,
      displayName: profiles.displayName,
      bio: profiles.bio,
      avatarUrl: profiles.avatarUrl,
    })

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Profile tidak ditemukan' })
  }

  return updated
})
