import type { H3Event } from 'h3'

const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const
const UTM_VALUE_MAX = 200

export interface ParsedUtm {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  utmJson?: Record<string, string>
}

/**
 * Parse UTM dari query string URL (dipakai di redirect route /r/:linkId).
 */
export function parseUtmFromQuery(query: Record<string, string | string[] | undefined>): ParsedUtm {
  const result: ParsedUtm = {}
  const extras: Record<string, string> = {}

  for (const [key, rawValue] of Object.entries(query)) {
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue
    if (!value) continue

    const trimmed = value.slice(0, UTM_VALUE_MAX)

    if (key === 'utm_source') result.utmSource = trimmed
    else if (key === 'utm_medium') result.utmMedium = trimmed
    else if (key === 'utm_campaign') result.utmCampaign = trimmed
    else if (key === 'utm_term') result.utmTerm = trimmed
    else if (key === 'utm_content') result.utmContent = trimmed
    else if (key.startsWith('utm_')) {
      extras[key] = trimmed
    }
  }

  if (Object.keys(extras).length > 0) {
    result.utmJson = extras
  }

  return result
}

/**
 * Ambil user-agent dari header request.
 */
export function getUserAgent(event: H3Event): string | undefined {
  return getRequestHeader(event, 'user-agent')?.slice(0, 500) ?? undefined
}

/**
 * Ambil referrer dari header request.
 */
export function getReferrerFromHeader(event: H3Event): string | undefined {
  return getRequestHeader(event, 'referer')?.slice(0, 500) ?? undefined
}
