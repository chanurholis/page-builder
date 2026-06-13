import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
  bigserial,
  index,
  unique,
} from 'drizzle-orm/pg-core'

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// profiles
// ---------------------------------------------------------------------------

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  username: text('username').notNull().unique(),
  displayName: text('display_name'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  themeJson: jsonb('theme_json').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// pages
// ---------------------------------------------------------------------------

export const pages = pgTable(
  'pages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').notNull().default('home'),
    // 'draft' | 'published'
    status: text('status').notNull().default('draft'),
    layoutJson: jsonb('layout_json').$type<Record<string, unknown>>(),
    seoJson: jsonb('seo_json').$type<Record<string, unknown>>(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('pages_profile_id_slug_unique').on(t.profileId, t.slug),
    index('pages_profile_id_status_idx').on(t.profileId, t.status),
  ],
)

// ---------------------------------------------------------------------------
// blocks
// ---------------------------------------------------------------------------

export const blocks = pgTable(
  'blocks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pageId: uuid('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
    // 'hero' | 'text' | 'link_list' | 'image' | etc.
    type: text('type').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    contentJson: jsonb('content_json').$type<Record<string, unknown>>(),
    styleJson: jsonb('style_json').$type<Record<string, unknown>>(),
    isVisible: boolean('is_visible').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('blocks_page_id_sort_order_idx').on(t.pageId, t.sortOrder),
  ],
)

// ---------------------------------------------------------------------------
// links
// ---------------------------------------------------------------------------

export const links = pgTable(
  'links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pageId: uuid('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
    blockId: uuid('block_id').references(() => blocks.id, { onDelete: 'set null' }),
    label: text('label').notNull(),
    url: text('url').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    metaJson: jsonb('meta_json').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('links_page_id_is_active_idx').on(t.pageId, t.isActive),
  ],
)

// ---------------------------------------------------------------------------
// page_visits  (analytics — append-only)
// ---------------------------------------------------------------------------

export const pageVisits = pgTable(
  'page_visits',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'set null' }),
    pageId: uuid('page_id').references(() => pages.id, { onDelete: 'set null' }),
    profileUsername: text('profile_username').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
    referrer: text('referrer'),
    userAgent: text('user_agent'),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    utmTerm: text('utm_term'),
    utmContent: text('utm_content'),
    utmJson: jsonb('utm_json').$type<Record<string, string>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('page_visits_page_id_timestamp_idx').on(t.pageId, t.timestamp),
    index('page_visits_profile_username_timestamp_idx').on(t.profileUsername, t.timestamp),
  ],
)

// ---------------------------------------------------------------------------
// link_clicks  (analytics — append-only)
// ---------------------------------------------------------------------------

export const linkClicks = pgTable(
  'link_clicks',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    linkId: uuid('link_id').notNull().references(() => links.id, { onDelete: 'cascade' }),
    profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'set null' }),
    pageId: uuid('page_id').references(() => pages.id, { onDelete: 'set null' }),
    profileUsername: text('profile_username').notNull(),
    targetUrl: text('target_url').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
    referrer: text('referrer'),
    userAgent: text('user_agent'),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    utmTerm: text('utm_term'),
    utmContent: text('utm_content'),
    utmJson: jsonb('utm_json').$type<Record<string, string>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('link_clicks_link_id_timestamp_idx').on(t.linkId, t.timestamp),
    index('link_clicks_page_id_timestamp_idx').on(t.pageId, t.timestamp),
    index('link_clicks_profile_username_timestamp_idx').on(t.profileUsername, t.timestamp),
  ],
)

// ---------------------------------------------------------------------------
// Type exports (Drizzle inferred types)
// ---------------------------------------------------------------------------

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert

export type Page = typeof pages.$inferSelect
export type NewPage = typeof pages.$inferInsert

export type Block = typeof blocks.$inferSelect
export type NewBlock = typeof blocks.$inferInsert

export type Link = typeof links.$inferSelect
export type NewLink = typeof links.$inferInsert

export type PageVisit = typeof pageVisits.$inferSelect
export type LinkClick = typeof linkClicks.$inferSelect
