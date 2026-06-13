import type { H3Event } from 'h3'

/**
 * Ambil session user dari cookie.
 * Throw 401 jika tidak ada session.
 *
 * Nama sengaja berbeda dari `requireUserSession` bawaan nuxt-auth-utils
 * untuk menghindari duplicate-import warning.
 */
export async function assertUserSession(event: H3Event) {
  const session = await getUserSession(event)

  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return session.user as { id: string; email: string }
}
