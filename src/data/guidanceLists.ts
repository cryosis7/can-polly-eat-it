import type { GuidanceList } from '../domain/schemas'

export const guidanceLists: GuidanceList[] = [
  {
    id: 'pregnancy-food-safety',
    slug: 'pregnancy-food-safety',
    title: 'Pregnancy food safety',
    description: 'Reviewed food-safety guidance for pregnancy.',
    unassessedStatusId: 'pregnancy-not-assessed',
    outOfCoverageStatusId: 'pregnancy-outside-coverage',
    statuses: [
      { id: 'pregnancy-ok', slug: 'ok-to-eat', label: 'OK to eat', tone: 'green', sortOrder: 1, filterLabel: 'OK to eat' },
      { id: 'pregnancy-conditions', slug: 'only-with-conditions', label: 'Only with conditions', tone: 'amber', sortOrder: 2, filterLabel: 'Only with conditions' },
      { id: 'pregnancy-avoid', slug: 'avoid', label: 'Avoid', tone: 'red', sortOrder: 3, filterLabel: 'Avoid' },
      { id: 'pregnancy-not-assessed', slug: 'not-assessed', label: 'Not assessed', tone: 'grey', sortOrder: 4, filterLabel: 'Not assessed' },
      { id: 'pregnancy-outside-coverage', slug: 'outside-current-coverage', label: 'Outside current coverage', tone: 'grey', sortOrder: 5, filterLabel: 'Outside current coverage' },
    ],
    coverage: {
      mode: 'category-subtrees-and-foods',
      categoryIds: ['dairy', 'prepared-foods'],
      foodIds: [],
      description: 'Dairy and prepared foods reviewed for this initial guide.',
      sourceVersionEvidence: 'MPI Food and pregnancy guidance reviewed on 2026-08-04.',
      verifiedOn: '2026-08-04',
      reviewDueOn: '2027-08-04',
      citations: [{
        title: 'MPI: Food and pregnancy',
        url: 'https://www.mpi.govt.nz/food-safety-home/food-pregnancy/',
        locator: 'Food and pregnancy overview',
        accessedOn: '2026-08-04',
      }],
    },
  },
]
