import type { GuidanceList } from '../domain/schemas'

export const guidanceLists: GuidanceList[] = [
  {
    id: 'pregnancy-food-safety',
    slug: 'pregnancy-food-safety',
    title: 'Pregnancy food safety',
    description: 'Food-safety guidance for pregnancy from New Zealand Food Safety and reviewed tea and herbal-drink sources.',
    citationPolicy: 'required',
    sourceIds: [
      'new-zealand-food-safety',
      'medeniyet-medical-journal',
      'american-pregnancy-association',
      'babycenter',
    ],
    unassessedStatusId: 'pregnancy-not-assessed',
    statuses: [
      { id: 'pregnancy-ok', slug: 'ok-to-eat', label: 'OK to eat', tone: 'green', outcomeBand: 'okay', sortOrder: 1, filterLabel: 'OK to eat', summary: 'The guide lists this food as okay to eat.' },
      { id: 'pregnancy-conditions', slug: 'only-with-conditions', label: 'Only with conditions', tone: 'amber', outcomeBand: 'maybe', sortOrder: 2, filterLabel: 'Only with conditions', summary: 'The guide says this food is okay to eat only when its conditions are met.' },
      // A source that declines to judge is not a source that judged conditionally. This status exists
      // so "insufficient reliable information available" is shown in those terms rather than being
      // flattened into a conditional verdict the source never reached. It shares the `maybe` band
      // with `pregnancy-conditions`, so the outcome filter groups the two while the words separate
      // them; that imprecision was accepted in preference to misattributing a verdict.
      { id: 'pregnancy-insufficient-evidence', slug: 'not-enough-evidence', label: 'Not enough evidence', tone: 'amber', outcomeBand: 'maybe', sortOrder: 3, filterLabel: 'Not enough evidence', summary: 'No reliable evidence has been published about having this during pregnancy.' },
      { id: 'pregnancy-avoid', slug: 'avoid', label: 'Avoid', tone: 'red', outcomeBand: 'not-okay', sortOrder: 4, filterLabel: 'Avoid', summary: 'The guide says not to eat this during pregnancy.' },
      { id: 'pregnancy-not-assessed', slug: 'not-assessed', label: 'Not assessed', tone: 'grey', outcomeBand: 'not-assessed', sortOrder: 5, filterLabel: 'Not assessed', summary: 'This item has not been added to this guide yet, so it has not been assessed.' },
    ],
    unassessedNotice: {
      description: 'This item has not been added to this guide yet, so it has not been assessed.',
      citations: [{
        title: 'New Zealand Food Safety: Pullout guide to food safety in pregnancy',
        url: 'https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy',
        locator: 'June 2026 pullout guide: all food-type tables and recommended fish servings',
      }],
    },
  },
  {
    id: 'vegetarian-suitability',
    slug: 'vegetarian-suitability',
    title: 'Vegetarian suitability',
    description: 'Article-backed guidance for foods that can contain animal-derived ingredients.',
    citationPolicy: 'optional',
    sourceIds: [],
    evidentiaryBasis: 'Reflects general vegetarian knowledge; sources are attached where a useful one exists.',
    unassessedStatusId: 'vegetarian-not-assessed',
    statuses: [
      { id: 'vegetarian-suitable', slug: 'vegetarian', label: 'Vegetarian', tone: 'green', outcomeBand: 'okay', sortOrder: 1, filterLabel: 'Vegetarian', summary: 'This food is suitable for vegetarians.' },
      { id: 'vegetarian-animal-derived', slug: 'contains-animal-derived-ingredients', label: 'Contains animal-derived ingredients', tone: 'red', outcomeBand: 'not-okay', sortOrder: 2, filterLabel: 'Contains animal-derived ingredients', summary: 'This food contains animal-derived ingredients.' },
      { id: 'vegetarian-check-ingredients', slug: 'check-ingredients', label: 'Check ingredients', tone: 'amber', outcomeBand: 'maybe', sortOrder: 3, filterLabel: 'Check ingredients', summary: 'This food can contain animal-derived ingredients, so check the label.' },
      { id: 'vegetarian-not-assessed', slug: 'not-assessed', label: 'Not assessed', tone: 'grey', outcomeBand: 'not-assessed', sortOrder: 4, filterLabel: 'Not assessed', summary: 'This item has not been added to this guide yet, so it has not been assessed.' },
    ],
    unassessedNotice: {
      description: 'This item has not been added to this guide yet, so it has not been assessed.',
      citations: [{
        title: 'Veggy Malta: 15 Products Not Vegetarian',
        url: 'https://veggymalta.com/15-products-not-vegetarian/',
        locator: '15 non-vegetarian foods',
      }],
    },
  },
]
