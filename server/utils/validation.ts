import { z } from 'zod'
import { isReservedSlug } from '../../shared/utils/reserved-slugs'

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const signupSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .max(128, 'Password terlalu panjang'),
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(30, 'Username maksimal 30 karakter')
    .regex(/^[a-z0-9_-]+$/, 'Username hanya boleh huruf kecil, angka, - dan _')
    .toLowerCase()
    .trim()
    .refine((val) => !isReservedSlug(val), {
      message: 'Username ini tidak tersedia',
    }),
  displayName: z.string().min(1).max(60).trim().optional(),
})

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
})

// ---------------------------------------------------------------------------
// Page/block/link schemas
// ---------------------------------------------------------------------------

export const createPageSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  slug: z.string().min(1).max(60).trim().optional().default('home'),
})

export const updatePageSchema = z.object({
  title: z.string().min(1).max(100).trim().optional(),
  layoutJson: z.record(z.unknown()).optional(),
  seoJson: z.record(z.unknown()).optional(),
})

const ALLOWED_BLOCK_TYPES = ['hero', 'text', 'link_list', 'image'] as const

export const createBlockSchema = z.object({
  type: z.enum(ALLOWED_BLOCK_TYPES),
  sortOrder: z.number().int().min(0).optional().default(0),
  contentJson: z.record(z.unknown()).optional(),
  styleJson: z.record(z.unknown()).optional(),
})

export const updateBlockSchema = z.object({
  sortOrder: z.number().int().min(0).optional(),
  contentJson: z.record(z.unknown()).optional(),
  styleJson: z.record(z.unknown()).optional(),
  isVisible: z.boolean().optional(),
})

const safeUrlSchema = z
  .string()
  .url()
  .refine(
    (url) => {
      try {
        const { protocol } = new URL(url)
        return protocol === 'http:' || protocol === 'https:'
      } catch {
        return false
      }
    },
    { message: 'URL harus menggunakan http atau https' },
  )

export const createLinkSchema = z.object({
  label: z.string().min(1).max(100).trim(),
  url: safeUrlSchema,
  sortOrder: z.number().int().min(0).optional().default(0),
  blockId: z.string().uuid().optional(),
  metaJson: z.record(z.unknown()).optional(),
})

export const updateLinkSchema = z.object({
  label: z.string().min(1).max(100).trim().optional(),
  url: safeUrlSchema.optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  metaJson: z.record(z.unknown()).optional(),
})

// ---------------------------------------------------------------------------
// Tracking schemas
// ---------------------------------------------------------------------------

const UTM_ALLOWLIST = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const
const UTM_VALUE_MAX = 200

export const visitPayloadSchema = z.object({
  referrer: z.string().max(500).optional(),
  utmSource: z.string().max(UTM_VALUE_MAX).optional(),
  utmMedium: z.string().max(UTM_VALUE_MAX).optional(),
  utmCampaign: z.string().max(UTM_VALUE_MAX).optional(),
  utmTerm: z.string().max(UTM_VALUE_MAX).optional(),
  utmContent: z.string().max(UTM_VALUE_MAX).optional(),
  utmJson: z.record(z.string().max(UTM_VALUE_MAX)).optional(),
})

export { UTM_ALLOWLIST }
