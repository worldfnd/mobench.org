import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { docsLoader } from '@astrojs/starlight/loaders'
import { docsSchema } from '@astrojs/starlight/schema'

const sourceReference = z.object({
  label: z.string().min(1),
  url: z.url(),
  evidence: z.string().min(1).optional(),
})

const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema({
    extend: z.object({
      slug: z.string().regex(/^(?:index|[a-z0-9]+(?:-[a-z0-9]+)*)$/),
      audience: z
        .array(z.enum(['new-user', 'benchmark-author', 'ci-engineer', 'contributor']))
        .optional(),
      release: z.string().optional(),
      lastVerified: z.coerce.date().optional(),
      sourceRefs: z.array(sourceReference).optional(),
      aliases: z.array(z.string().startsWith('/')).default([]),
      section: z.string().optional(),
      order: z.number().int().nonnegative().optional(),
      og: z
        .object({
          image: z.string().startsWith('/'),
          alt: z.string().min(1),
        })
        .optional(),
    }),
  }),
})

export const collections = { docs }
