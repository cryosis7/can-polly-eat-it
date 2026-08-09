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

export const sourceSchema = z.object({
  id: identifier,
  slug: identifier,
  name: z.string().trim().min(1),
  organisation: z.string().trim().min(1),
  homeUrl: z.url().refine((value) => value.startsWith('https://'), 'Source URL must use HTTPS.').optional(),
})

export const statusDefinitionSchema = z.object({
  id: identifier,
  slug: identifier,
  label: z.string().trim().min(1),
  tone: z.enum(['green', 'amber', 'red', 'grey']),
  outcomeBand: z.enum(['okay', 'maybe', 'not-okay', 'not-assessed']),
  sortOrder: z.number().int().nonnegative(),
  filterLabel: z.string().trim().min(1),
  /**
   * The list's own wording for this status, displayed when an assessment authors no summary of its
   * own. It belongs to the list so that agreeing sources can share one authored sentence rather than
   * two sentences being merged into a third nobody wrote.
   */
  summary: z.string().trim().min(1),
})

export const unassessedNoticeSchema = z.object({
  description: z.string().trim().min(1),
  citations: z.array(sourceCitationSchema),
})

export const guidanceListSchema = z.object({
  id: identifier,
  slug: identifier,
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  citationPolicy: z.enum(['required', 'optional']),
  /**
   * The authorities this list draws on. A list standing on its `evidentiaryBasis` rather than a
   * named authority declares none.
   */
  sourceIds: z.array(identifier),
  evidentiaryBasis: z.string().trim().min(1).optional(),
  unassessedStatusId: identifier,
  statuses: z.array(statusDefinitionSchema).min(2),
  unassessedNotice: unassessedNoticeSchema,
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

export const assessmentSubjectSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('food'), foodId: identifier }),
  z.object({ kind: z.literal('category'), categoryId: identifier }),
])

export const assessmentSchema = z.object({
  id: identifier,
  subject: assessmentSubjectSchema,
  guidanceListId: identifier,
  statusId: identifier,
  /**
   * The authority that stated this assessment. Required in a list declaring two or more sources,
   * and absent in a single-source or no-source list, where the list itself supplies attribution.
   */
  sourceId: identifier.optional(),
  /**
   * The source's own wording. Absent where the source has nothing specific to say, in which case the
   * list's canonical wording for the resolved status is displayed.
   */
  summary: z.string().trim().min(1).optional(),
  scopeStatement: z.string().trim().min(1).optional(),
  /**
   * Whether this assessment replaces the guidance it inherits or adds to it. Absent means
   * 'replaces', which is the behaviour of every assessment authored before accumulation existed.
   */
  relation: z.enum(['replaces', 'adds-to']).optional(),
  guidanceScenarios: z.array(guidanceScenarioSchema),
  reasonLinks: z.array(assessmentReasonLinkSchema),
  citations: z.array(sourceCitationSchema),
})

export type Category = z.infer<typeof categorySchema>
export type Food = z.infer<typeof foodSchema>
export type Source = z.infer<typeof sourceSchema>
export type GuidanceList = z.infer<typeof guidanceListSchema>
export type AssessmentSubject = z.infer<typeof assessmentSubjectSchema>
export type Assessment = z.infer<typeof assessmentSchema>
export type StatusDefinition = z.infer<typeof statusDefinitionSchema>
export type OutcomeBand = StatusDefinition['outcomeBand']
export type SourceCitation = z.infer<typeof sourceCitationSchema>
