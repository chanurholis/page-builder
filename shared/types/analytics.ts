export interface AnalyticsSummary {
  totalVisits: number
  totalClicks: number
  ctr: number // 0–1 decimal
  clicksPerLink: LinkClickStat[]
  recentVisits: RecentVisit[]
}

export interface LinkClickStat {
  linkId: string
  label: string
  clicks: number
}

export interface RecentVisit {
  id: number
  timestamp: string
  referrer: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
}
