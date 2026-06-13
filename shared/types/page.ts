// Tipe yang dipakai di client dan server

export type PageStatus = 'draft' | 'published'

export type BlockType = 'hero' | 'text' | 'link_list' | 'image'

export interface PublicLink {
  id: string
  label: string
  redirectUrl: string // /r/:linkId
  sortOrder: number
}

export interface PublicBlock {
  id: string
  type: BlockType
  sortOrder: number
  contentJson: Record<string, unknown>
  styleJson: Record<string, unknown>
  links?: PublicLink[]
}

export interface PublicProfile {
  username: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  themeJson: Record<string, unknown> | null
}

export interface PublicPageData {
  profile: PublicProfile
  page: {
    id: string
    title: string
    slug: string
    seoJson: Record<string, unknown> | null
  }
  blocks: PublicBlock[]
}
