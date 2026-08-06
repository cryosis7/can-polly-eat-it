import type { GuidanceList } from '../domain/schemas'

export const guidanceLists: GuidanceList[] = [
  {
    id: 'pregnancy-food-safety',
    slug: 'pregnancy-food-safety',
    title: 'Pregnancy food safety',
    description: 'Food-safety guidance for pregnancy from New Zealand Food Safety.',
    unassessedStatusId: 'pregnancy-not-assessed',
    outOfCoverageStatusId: 'pregnancy-outside-coverage',
    statuses: [
      { id: 'pregnancy-ok', slug: 'ok-to-eat', label: 'OK to eat', tone: 'green', outcomeBand: 'okay', sortOrder: 1, filterLabel: 'OK to eat' },
      { id: 'pregnancy-conditions', slug: 'only-with-conditions', label: 'Only with conditions', tone: 'amber', outcomeBand: 'maybe', sortOrder: 2, filterLabel: 'Only with conditions' },
      { id: 'pregnancy-avoid', slug: 'avoid', label: 'Avoid', tone: 'red', outcomeBand: 'not-okay', sortOrder: 3, filterLabel: 'Avoid' },
      { id: 'pregnancy-not-assessed', slug: 'not-assessed', label: 'Not assessed', tone: 'grey', outcomeBand: 'not-assessed', sortOrder: 4, filterLabel: 'Not assessed' },
      { id: 'pregnancy-outside-coverage', slug: 'outside-current-coverage', label: 'Outside current coverage', tone: 'grey', outcomeBand: 'outside-coverage', sortOrder: 5, filterLabel: 'Outside current coverage' },
    ],
    coverage: {
      mode: 'all-catalogue',
      categoryIds: [],
      foodIds: [],
      description: 'All food categories and named foods in the June 2026 MPI pullout guide are covered.',
      citations: [{
        title: 'New Zealand Food Safety: Pullout guide to food safety in pregnancy',
        url: 'https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy',
        locator: 'June 2026 pullout guide: all food-type tables and recommended fish servings',
      }],
    },
  },
]
