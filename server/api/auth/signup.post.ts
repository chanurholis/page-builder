import { eq } from 'drizzle-orm'
import { useDb } from '../../utils/db'
import { users, profiles, pages } from '../../database/schema'
import { signupSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = signupSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation Error',
      data: parsed.error.flatten().fieldErrors,
    })
  }

  const { email, password, username, displayName } = parsed.data
  const db = useDb()

  // Cek email sudah terdaftar
  const existingEmail = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existingEmail.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Email sudah terdaftar' })
  }

  // Cek username sudah dipakai
  const existingUsername = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1)

  if (existingUsername.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Username sudah dipakai' })
  }

  // Hash password pakai nuxt-auth-utils
  const passwordHash = await hashPassword(password)

  // Insert user + profile + default page dalam satu transaksi
  const result = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ email, passwordHash })
      .returning({ id: users.id, email: users.email })

    const [profile] = await tx
      .insert(profiles)
      .values({
        userId: user.id,
        username,
        displayName: displayName ?? username,
      })
      .returning({ id: profiles.id, username: profiles.username })

    await tx.insert(pages).values({
      profileId: profile.id,
      title: 'My Page',
      slug: 'home',
      status: 'draft',
    })

    return { user, profile }
  })

  // Set session
  await setUserSession(event, {
    user: { id: result.user.id, email: result.user.email },
  })

  setResponseStatus(event, 201)
  return { username: result.profile.username }
})
