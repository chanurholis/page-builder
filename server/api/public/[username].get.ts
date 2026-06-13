import { and, asc, eq } from 'drizzle-orm'
import { useDb } from '../../utils/db'
import { profiles, pages, blocks, links } from '../../database/schema'
import type { PublicPageData, PublicBlock, PublicLink } from '../../../shared/types/page'

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')!.toLowerCase()
  const db = useDb()

  // Resolve profile
  const [profile] = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      displayName: profiles.displayName,
      bio: profiles.bio,
      avatarUrl: profiles.avatarUrl,
      themeJson: profiles.themeJson,
    })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1)

  if (!profile) {
    throw createError({ statusCode: 404, statusMessage: 'Halaman tidak ditemukan' })
  }

  // Ambil halaman published pertama (slug: home)
  const [page] = await db
    .select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      seoJson: pages.seoJson,
    })
    .from(pages)
    .where(and(eq(pages.profileId, profile.id), eq(pages.status, 'published')))
    .orderBy(asc(pages.createdAt))
    .limit(1)

  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Halaman belum dipublikasikan' })
  }

  // Blocks yang visible
  const pageBlocks = await db
    .select({
      id: blocks.id,
      type: blocks.type,
      sortOrder: blocks.sortOrder,
      contentJson: blocks.contentJson,
      styleJson: blocks.styleJson,
    })
    .from(blocks)
    .where(and(eq(blocks.pageId, page.id), eq(blocks.isVisible, true)))
    .orderBy(asc(blocks.sortOrder))

  // Links yang aktif
  const pageLinks = await db
    .select({
      id: links.id,
      blockId: links.blockId,
      label: links.label,
      url: links.url,
      sortOrder: links.sortOrder,
    })
    .from(links)
    .where(and(eq(links.pageId, page.id), eq(links.isActive, true)))
    .orderBy(asc(links.sortOrder))

  const config = useRuntimeConfig()
  const appUrl = config.public.appUrl

  // Map links ke redirect URL — jangan expose target URL langsung
  const linkMap = new Map<string, PublicLink[]>()
  for (const link of pageLinks) {
    const publicLink: PublicLink = {
      id: link.id,
      label: link.label,
      redirectUrl: `${appUrl}/r/${link.id}`,
      sortOrder: link.sortOrder,
    }
    const key = link.blockId ?? '__page__'
    if (!linkMap.has(key)) linkMap.set(key, [])
    linkMap.get(key)!.push(publicLink)
  }

  const publicBlocks: PublicBlock[] = pageBlocks.map((b) => ({
    id: b.id,
    type: b.type as PublicBlock['type'],
    sortOrder: b.sortOrder,
    contentJson: (b.contentJson as Record<string, unknown>) ?? {},
    styleJson: (b.styleJson as Record<string, unknown>) ?? {},
    links: linkMap.get(b.id) ?? [],
  }))

  // Links yang tidak terikat block manapun
  const standaloneLinks = linkMap.get('__page__') ?? []

  const response: PublicPageData & { standaloneLinks: PublicLink[] } = {
    profile: {
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      themeJson: (profile.themeJson as Record<string, unknown>) ?? null,
    },
    page: {
      id: page.id,
      title: page.title,
      slug: page.slug,
      seoJson: (page.seoJson as Record<string, unknown>) ?? null,
    },
    blocks: publicBlocks,
    standaloneLinks,
  }

  return response
})
