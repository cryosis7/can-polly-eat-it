import type { ContentData } from '../domain/contentValidation'
import type { Assessment, Category, Food, GuidanceList, Preparation, Source } from '../domain/schemas'

/**
 * Fixture content for a guidance list carrying two attributed authorities. F-17 curates no real
 * second authority, so agreement and disagreement are proven here rather than in reviewed content.
 */

export const nzfs: Source = {
  id: 'nzfs',
  slug: 'nzfs',
  name: 'New Zealand Food Safety',
  organisation: 'Ministry for Primary Industries',
  homeUrl: 'https://www.example-nzfs.govt.nz/',
}

export const nswHealth: Source = {
  id: 'nsw-health',
  slug: 'nsw-health',
  name: 'New South Wales Health',
  organisation: 'NSW Government',
}

export const dualSourceList: GuidanceList = {
  id: 'dual',
  slug: 'dual',
  title: 'Dual-source guidance',
  description: 'A guidance list carrying two authorities.',
  citationPolicy: 'optional',
  sourceIds: ['nzfs', 'nsw-health'],
  evidentiaryBasis: 'Fixture content for multi-source behaviour.',
  unassessedStatusId: 'dual-not-assessed',
  statuses: [
    { id: 'dual-ok', slug: 'ok', label: 'OK to eat', tone: 'green', outcomeBand: 'okay', sortOrder: 1, filterLabel: 'OK to eat', summary: 'The guide lists this food as okay to eat.' },
    { id: 'dual-conditions', slug: 'conditions', label: 'Only with conditions', tone: 'amber', outcomeBand: 'maybe', sortOrder: 2, filterLabel: 'Only with conditions', summary: 'The guide says this food is okay to eat only when its conditions are met.' },
    { id: 'dual-avoid', slug: 'avoid', label: 'Avoid', tone: 'red', outcomeBand: 'not-okay', sortOrder: 3, filterLabel: 'Avoid', summary: 'The guide says not to eat this.' },
    { id: 'dual-steer-clear', slug: 'steer-clear', label: 'Steer clear', tone: 'red', outcomeBand: 'not-okay', sortOrder: 4, filterLabel: 'Steer clear', summary: 'The guide says to steer clear of this.' },
    { id: 'dual-not-assessed', slug: 'not-assessed', label: 'Not assessed', tone: 'grey', outcomeBand: 'not-assessed', sortOrder: 5, filterLabel: 'Not assessed', summary: 'This has not been assessed.' },
  ],
  unassessedNotice: {
    description: 'This item has not been added to this guide yet, so it has not been assessed.',
    citations: [],
  },
}

export const seafood: Category = {
  id: 'seafood',
  slug: 'seafood',
  name: 'Seafood',
  parentId: null,
  aliases: [],
  sortOrder: 1,
}

export const shellfish: Category = {
  id: 'shellfish',
  slug: 'shellfish',
  name: 'Shellfish',
  parentId: 'seafood',
  aliases: [],
  sortOrder: 1,
}

export const makeFood = (id: string, primaryCategoryId = 'shellfish', preparationIds: string[] = []): Food => ({
  id,
  slug: id,
  name: id,
  aliases: [],
  primaryCategoryId,
  preparationIds,
  tags: [],
  sortOrder: 1,
})

export const oysters = makeFood('oysters')
export const mussels = makeFood('mussels')
export const scallops = makeFood('scallops')
export const crayfish = makeFood('crayfish')

type AssessmentOverrides = Partial<Omit<Assessment, 'subject'>>

export const foodAssessment = (
  id: string,
  foodId: string,
  statusId: string,
  overrides: AssessmentOverrides = {},
): Assessment => ({
  id,
  subject: { kind: 'food', foodId },
  guidanceListId: dualSourceList.id,
  statusId,
  guidanceScenarios: [],
  reasonLinks: [],
  citations: [],
  ...overrides,
})

export const categoryAssessment = (
  id: string,
  categoryId: string,
  statusId: string,
  overrides: AssessmentOverrides = {},
): Assessment => ({
  id,
  subject: { kind: 'category', categoryId },
  guidanceListId: dualSourceList.id,
  statusId,
  scopeStatement: `Applies to all ${categoryId}.`,
  guidanceScenarios: [],
  reasonLinks: [],
  citations: [],
  ...overrides,
})

export const fixturePreparations: Preparation[] = [
  { id: 'raw', slug: 'raw', name: 'Raw', sortOrder: 1 },
  { id: 'smoked', slug: 'smoked', name: 'Smoked', sortOrder: 3 },
  { id: 'cooked', slug: 'cooked', name: 'Cooked', sortOrder: 4 },
]

export const dualSourceContent = (assessments: Assessment[], foods: Food[] = [oysters, mussels, scallops, crayfish]): ContentData => ({
  categories: [seafood, shellfish],
  foods,
  preparations: fixturePreparations,
  sources: [nzfs, nswHealth],
  guidanceLists: [dualSourceList],
  assessments,
})
