import { z } from 'zod';

// Field Configuration Schema
export const fieldConfigSchema = z.object({
  type: z.enum(['text', 'email', 'tel', 'number', 'select', 'radio', 'checkbox', 'textarea']),
  name: z.string().min(1),
  label: z.string().min(1),
  placeholder: z.string().optional(),
  required: z.boolean(),
  min: z.number().optional(),
  max: z.number().optional(),
  options: z.array(z.string()).optional(),
});

// Step Configuration Schema
export const stepConfigSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  fields: z.array(fieldConfigSchema),
  nextStep: z.string().nullable(),
});

// Theme Configuration Schema
export const themeConfigSchema = z.object({
  primaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
});

// CTA Configuration Schema
export const ctaConfigSchema = z.object({
  text: z.string().min(1),
  href: z.string().min(1),
});

// Landing Configuration Schema
export const landingConfigSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  cta: ctaConfigSchema,
  image: z.string().optional(),
  theme: themeConfigSchema.optional(),
});

// Thank You Configuration Schema
export const thankYouConfigSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  cta: ctaConfigSchema.nullable().optional(),
});

// Variant Configuration Schema
export const variantConfigSchema = z.object({
  key: z.enum(['a', 'b', 'c']),
  weight: z.number().min(0).max(100),
  landing: landingConfigSchema,
  steps: z.array(stepConfigSchema),
  thankYou: thankYouConfigSchema,
});

// Tracking Configuration Schema
export const trackingConfigSchema = z.object({
  metaPixelId: z.string().optional(),
  ga4Id: z.string().optional(),
  gtmId: z.string().optional(),
});

// Funnel Configuration Schema
export const funnelConfigSchema = z.object({
  tracking: trackingConfigSchema.optional(),
  variants: z.array(variantConfigSchema).min(1),
});

// Create Funnel Request Schema
export const createFunnelSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  slug: z.string().min(1, 'Le slug est requis').regex(/^[a-z0-9-]+$/, 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets'),
  domain: z.string().optional(),
  description: z.string().optional(),
  tracking: trackingConfigSchema.optional(),
  template: z.enum(['simple', 'storytelling', 'quiz', 'blank']).optional(),
  tags: z.array(z.string()).optional(),
});

// Update Funnel Schema
export const updateFunnelSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  domain: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  config: funnelConfigSchema.optional(),
  tags: z.array(z.string()).optional(),
});

// Submit Lead Schema
export const submitLeadSchema = z.object({
  funnelId: z.string().uuid(),
  variant: z.enum(['a', 'b', 'c']),
  data: z.record(z.string(), z.any()),
  utmParams: z.record(z.string(), z.string()).optional(),
});

// Routing Rule Schema
export const routingRuleSchema = z.object({
  funnel_id: z.string().uuid(),
  priority: z.number().int().min(0),
  condition: z.object({
    field: z.string().min(1),
    operator: z.enum(['>', '>=', '<', '<=', '==', '!=', 'contains', 'startsWith', 'endsWith']),
    value: z.any(),
  }),
  webhook_url: z.string().url(),
  client_name: z.string().min(1),
  is_active: z.boolean().default(true),
});

export type CreateFunnelInput = z.infer<typeof createFunnelSchema>;
export type UpdateFunnelInput = z.infer<typeof updateFunnelSchema>;
export type SubmitLeadInput = z.infer<typeof submitLeadSchema>;
export type RoutingRuleInput = z.infer<typeof routingRuleSchema>;

