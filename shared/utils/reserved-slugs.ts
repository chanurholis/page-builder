/**
 * Dipakai di client (public page guard) dan server (signup validation).
 * Letakkan di shared/ agar bisa diimport dari keduanya.
 */
export const RESERVED_SLUGS = new Set([
  'api', 'auth', 'login', 'signup', 'logout', 'dashboard',
  'settings', 'admin', 'r', 'public', 'assets', 'pricing',
  'terms', 'privacy', 'about', 'help', 'support', 'status',
  'sitemap', 'robots', 'favicon', 'feed', 'rss', 'health',
  '_nuxt', '__nuxt',
])

export function isReservedSlug(username: string): boolean {
  return RESERVED_SLUGS.has(username.toLowerCase())
}
