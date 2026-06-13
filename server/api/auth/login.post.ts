import { eq } from 'drizzle-orm'
import { useDb } from '../../utils/db'
import { users, profiles } from '../../database/schema'
import { loginSchema } from '../../utils/validation'

const GENERIC_ERROR = 'Email atau password salah'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    // Gunakan pesan generik agar tidak membocorkan info
    throw createError({ statusCode: 401, statusMessage: GENERIC_ERROR })
  }

  const { email, password } = parsed.data
  const db = useDb()

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: GENERIC_ERROR })
  }

  const valid = await verifyPassword(user.passwordHash, password)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: GENERIC_ERROR })
  }

  // Ambil username untuk redirect
  const [profile] = await db
    .select({ username: profiles.username })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)

  await setUserSession(event, {
    user: { id: user.id, email: user.email },
  })

  return { username: profile?.username ?? null }
})
