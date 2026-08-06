import { z } from 'zod'

const identifier = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export const categorySchema = z.object({
  id: identifier,
  slug: identifier,
  name: z.string().trim().min(1),
  parentId: identifier.nullable(),
  aliases: z.array(z.string().trim().min(1)),
  sortOrder: z.number().int().nonnegative(),
})

export const foodSchema = z.object({
  id: identifier,
  slug: identifier,
  name: z.string().trim().min(1),
  aliases: z.array(z.string().trim().min(1)),
  primaryCategoryId: identifier,
  tags: z.array(identifier),
  sortOrder: z.number().int().nonnegative(),
})

export const sourceCitationSchema = z.object({
  title: z.string().trim().min(1),
  url: z.url().refine((value) => value.startsWith('https://'), 'Citation URL must use HTTPS.'),
  locator: z.string().trim().min(1),
})

export const statusDefinitionSchema = z.object({
  id: identifier,
  slug: identifier,
  label: z.string().trim().min(1),
  tone: z.enum(['green', 'amber', 'red', 'grey']),
  outcomeBand: z.enum(['okay', 'maybe', 'not-okay', 'not-assessed', 'outside-coverage']),
  sortOrder: z.number().int().nonnegative(),
  filterLabel: z.string().trim().min(1),
})

export const coverageDeclarationSchema = z.object({
  mode: z.enum(['all-catalogue', 'category-subtrees-and-foods']),
  categoryIds: z.array(identifier),
  foodIds: z.array(identifier),
  description: z.string().trim().min(1),
  citations: z.array(sourceCitationSchema),
})

export const guidanceListSchema = z.object({
  id: identifier,
  slug: identifier,
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  citationPolicy: z.enum(['required', 'optional']),
  evidentiaryBasis: z.string().trim().min(1).optional(),
  unassessedStatusId: identifier,
  outOfCoverageStatusId: identifier,
  statuses: z.array(statusDefinitionSchema).min(2),
  coverage: coverageDeclarationSchema,
})

export const adviceConditionSchema = z.object({
  id: identifier,
  kind: z.enum(['preparation', 'storage', 'serving', 'frequency', 'composition', 'other']),
  instruction: z.string().trim().min(1),
  facts: z.array(z.object({
    label: z.string().trim().min(1),
    valueText: z.string().trim().min(1),
  })).optional(),
})

export const guidanceScenarioSchema = z.object({
  id: identifier,
  applicability: z.string().trim().min(1),
  instruction: z.string().trim().min(1),
  conditions: z.array(adviceConditionSchema),
})

export const assessmentReasonLinkSchema = z.object({
  kind: z.enum(['contains', 'derived-from', 'made-with', 'other']),
  targetFoodId: identifier,
  statement: z.string().trim().min(1),
})

export const foodAssessmentSchema = z.object({
  id: identifier,
  foodId: identifier,
  guidanceListId: identifier,
  statusId: identifier,
  summary: z.string().trim().min(1),
  guidanceScenarios: z.array(guidanceScenarioSchema),
  reasonLinks: z.array(assessmentReasonLinkSchema),
  citations: z.array(sourceCitationSchema),
})

export type Category = z.infer<typeof categorySchema>
export type Food = z.infer<typeof foodSchema>
export type GuidanceList = z.infer<typeof guidanceListSchema>
export type FoodAssessment = z.infer<typeof foodAssessmentSchema>
export type StatusDefinition = z.infer<typeof statusDefinitionSchema>
export type OutcomeBand = StatusDefinition['outcomeBand']
export type SourceCitation = z.infer<typeof sourceCitationSchema>
