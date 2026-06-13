const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const
const UTM_VALUE_MAX = 200

export interface UtmData {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  utmJson?: Record<string, string>
}

export function usePublicUtm(): UtmData {
  if (!import.meta.client) return {}

  const params = new URLSearchParams(window.location.search)
  const result: UtmData = {}
  const extras: Record<string, string> = {}

  for (const [key, value] of params.entries()) {
    const trimmed = value.slice(0, UTM_VALUE_MAX)
    if (key === 'utm_source') result.utmSource = trimmed
    else if (key === 'utm_medium') result.utmMedium = trimmed
    else if (key === 'utm_campaign') result.utmCampaign = trimmed
    else if (key === 'utm_term') result.utmTerm = trimmed
    else if (key === 'utm_content') result.utmContent = trimmed
    else if (key.startsWith('utm_')) extras[key] = trimmed
  }

  if (Object.keys(extras).length > 0) result.utmJson = extras

  return result
}
