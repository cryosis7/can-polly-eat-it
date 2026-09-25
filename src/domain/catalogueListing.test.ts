import { describe, expect, it } from 'vitest'
import { contentIndex } from '../data'
import { buildContentIndex } from '../test/buildContentIndex'
import { listCatalogue, type CatalogueListing } from './catalogueListing'
import { initialCollapseState, toggleCategory, type CollapseState } from './collapseState'
import type { ContentIndex } from './contentIndex'
import type { FoodFilterState } from './filtering'
import type { Assessment, AssessmentSubject, Category, Food, GuidanceList, Preparation } from './schemas'

const guidanceList = (id: string): GuidanceList => ({
  id,
  slug: id,
  title: `${id} list`,
  description: `The ${id} list.`,
  citationPolicy: 'optional',
  sourceIds: [],
  evidentiaryBasis: 'Fixture content.',
  unassessedStatusId: `${id}-not-assessed`,
  statuses: [
    { id: `${id}-ok`, slug: 'ok', label: 'OK', tone: 'green', outcomeBand: 'okay', sortOrder: 1, filterLabel: 'OK', summary: 'OK to eat.' },
    { id: `${id}-conditions`, slug: 'conditions', label: 'Conditions', tone: 'amber', outcomeBand: 'maybe', sortOrder: 2, filterLabel: 'Conditions', summary: 'Only with conditions.' },
    { id: `${id}-avoid`, slug: 'avoid', label: 'Avoid', tone: 'red', outcomeBand: 'not-okay', sortOrder: 3, filterLabel: 'Avoid', summary: 'Do not eat.' },
    { id: `${id}-not-assessed`, slug: 'not-assessed', label: 'Not assessed', tone: 'grey', outcomeBand: 'not-assessed', sortOrder: 4, filterLabel: 'Not assessed', summary: 'Not assessed.' },
  ],
  unassessedNotice: { description: 'Not assessed yet.', citations: [] },
})

const category = (id: string, name: string, parentId: string | null, sortOrder = 1): Category =>
  ({ id, slug: id, name, parentId, aliases: [], sortOrder })

const food = (id: string, primaryCategoryId: string, preparationIds: string[] = [], sortOrder = 1): Food =>
  ({ id, slug: id, name: id, aliases: [], primaryCategoryId, preparationIds, tags: [], sortOrder })

const preparation = (id: string, name: string, sortOrder: number): Preparation => ({ id, slug: id, name, sortOrder })

type Status = 'ok' | 'conditions' | 'avoid'

const assessment = (
  guidanceListId: string,
  subject: AssessmentSubject,
  status: Status,
  preparationId?: string,
): Assessment => {
  const subjectId = subject.kind === 'food' ? subject.foodId : subject.categoryId
  return {
    id: `${guidanceListId}-${subjectId}-${preparationId ?? 'all'}`,
    subject,
    guidanceListId,
    statusId: `${guidanceListId}-${status}`,
    preparationId,
    summary: `${guidanceListId} ${status} for ${subjectId}${preparationId ? ` ${preparationId}` : ''}.`,
    scopeStatement: subject.kind === 'category' ? `Applies to all ${subjectId}.` : undefined,
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [],
  }
}
const onFood = (foodId: string): AssessmentSubject => ({ kind: 'food', foodId })
const onCategory = (categoryId: string): AssessmentSubject => ({ kind: 'category', categoryId })

const pregnancy = guidanceList('pregnancy')
const vegetarian = guidanceList('vegetarian')

/**
 * Dairy > Cheese > Hard cheese holds its own rule and two foods; Parmesan is not vegetarian. Seafood
 * states one smoked rule for its descendants, and Fish lists Salmon raw and smoked. Drinks holds a
 * juice assessed only for pregnancy and a lemonade nobody has assessed. Snacks holds nothing.
 */
const guideContent = {
  categories: [
    category('dairy', 'Dairy', null, 1),
    category('cheese', 'Cheese', 'dairy'),
    category('hard-cheese', 'Hard cheese', 'cheese'),
    category('seafood', 'Seafood', null, 2),
    category('fish', 'Fish', 'seafood'),
    category('snacks', 'Snacks', null, 3),
    category('drinks', 'Drinks', null, 4),
    category('juice', 'Juice', 'drinks', 1),
    category('soft-drinks', 'Soft drinks', 'drinks', 2),
  ],
  foods: [
    food('milk', 'dairy'),
    food('parmesan', 'hard-cheese', [], 2),
    food('cheddar', 'hard-cheese', [], 1),
    food('salmon', 'fish', ['smoked', 'raw']),
    food('orange-juice', 'juice'),
    food('lemonade', 'soft-drinks'),
  ],
  preparations: [preparation('raw', 'Raw', 1), preparation('smoked', 'Smoked', 2)],
  guidanceLists: [pregnancy, vegetarian],
  assessments: [
    assessment('pregnancy', onFood('milk'), 'ok'),
    assessment('pregnancy', onCategory('hard-cheese'), 'ok'),
    assessment('vegetarian', onCategory('hard-cheese'), 'ok'),
    assessment('vegetarian', onFood('parmesan'), 'avoid'),
    assessment('pregnancy', onCategory('seafood'), 'conditions', 'smoked'),
    assessment('pregnancy', onFood('salmon'), 'avoid', 'raw'),
    assessment('vegetarian', onFood('salmon'), 'avoid'),
    assessment('pregnancy', onFood('orange-juice'), 'ok'),
  ],
}

const index = buildContentIndex(guideContent)

const browsing = (guidanceListIds = ['pregnancy']): FoodFilterState => ({ query: '', guidanceListIds, outcomeBands: [] })

/** Every root expanded; nested categories start expanded, so the whole tree is open. */
const expandedCollapse = (on: ContentIndex = index) => on.categories
  .filter((candidate) => candidate.parentId === null)
  .reduce((state, root) => toggleCategory(state, root.id, browsing()), initialCollapseState(on))

const collapsing = (categoryIds: string[], filters: FoodFilterState, from: CollapseState = expandedCollapse()) =>
  categoryIds.reduce((state, categoryId) => toggleCategory(state, categoryId, filters), from)

const sectionOf = (listing: CatalogueListing, categoryId: string) =>
  listing.sections.find((section) => section.category.id === categoryId)
const sectionIds = (listing: CatalogueListing) => listing.sections.map((section) => section.category.id)

describe('catalogue listing sections', () => {
  it('lists every category holding an entry and every ancestor of one, flat and depth-first in editorial order', () => {
    const listing = listCatalogue(index, browsing(), expandedCollapse())

    expect(listing.sections.map(({ category: { id }, breadcrumb, depth }) => [id, breadcrumb, depth])).toEqual([
      ['dairy', 'Dairy', 0],
      ['cheese', 'Dairy > Cheese', 1],
      ['hard-cheese', 'Dairy > Cheese > Hard cheese', 2],
      ['seafood', 'Seafood', 0],
      ['fish', 'Seafood > Fish', 1],
      ['drinks', 'Drinks', 0],
      ['juice', 'Drinks > Juice', 1],
      ['soft-drinks', 'Drinks > Soft drinks', 1],
    ])
  })

  it('lists only the root sections by default, collapsed and chip-free however much they hide', () => {
    const listing = listCatalogue(index, browsing(), initialCollapseState(index))

    expect(listing.sections.map(({ category: { id }, collapsed, chip }) => [id, collapsed, chip]))
      .toEqual([['dairy', true, undefined], ['seafood', true, undefined], ['drinks', true, undefined]])
  })

  it('hides the descendants of a collapsed section and leaves its siblings listed', () => {
    const listing = listCatalogue(index, browsing(), collapsing(['cheese'], browsing()))

    expect(sectionIds(listing)).toEqual(['dairy', 'cheese', 'seafood', 'fish', 'drinks', 'juice', 'soft-drinks'])
    expect(sectionOf(listing, 'cheese')!.collapsed).toBe(true)
    expect(sectionOf(listing, 'dairy')!.collapsed).toBe(false)
  })

  it('chips a collapsed nested section with the outcome its whole subtree agrees on, and drops it once expanded', () => {
    const collapsed = collapsing(['hard-cheese'], browsing())

    expect(sectionOf(listCatalogue(index, browsing(), collapsed), 'hard-cheese')!.chip).toBe('okay')
    expect(sectionOf(listCatalogue(index, browsing(), collapsing(['hard-cheese'], browsing(), collapsed)), 'hard-cheese')!.chip)
      .toBeUndefined()
  })

  it('lets a second scope turn a uniform chip mixed, because one dissenting entry is enough', () => {
    const bothScopes = browsing(['pregnancy', 'vegetarian'])

    // Under pregnancy alone the rule, Cheddar, and Parmesan all say okay; Parmesan is not vegetarian.
    expect(sectionOf(listCatalogue(index, browsing(), collapsing(['cheese'], browsing())), 'cheese')!.chip).toBe('okay')
    expect(sectionOf(listCatalogue(index, bothScopes, collapsing(['cheese'], bothScopes)), 'cheese')!.chip).toBe('maybe')
  })

  it('counts every entry in a subtree, its own guidance and each preparation row included, collapsed or not', () => {
    const counts = (collapse: CollapseState) => Object.fromEntries(
      listCatalogue(index, browsing(), collapse).sections.map((section) => [section.category.id, section.entryCount]),
    )

    expect(counts(expandedCollapse())).toEqual({
      dairy: 4, cheese: 3, 'hard-cheese': 3, seafood: 2, fish: 2, drinks: 2, juice: 1, 'soft-drinks': 1,
    })
    expect(counts(initialCollapseState(index))).toEqual({ dairy: 4, seafood: 2, drinks: 2 })
  })

  it('counts food rows and category entries once, dropping an ancestor rule a descendant band already states', () => {
    // Seven food rows (Salmon twice) and the Hard cheese rule. Seafood's smoked rule is stated at the
    // head of Fish's smoked band, beside Salmon, so it is not listed or counted a second time.
    expect(listCatalogue(index, browsing(), expandedCollapse()).resultCount).toBe(8)
    expect(sectionOf(listCatalogue(index, browsing(), expandedCollapse()), 'seafood')!.entryCount).toBe(2)
  })

  it('leaves the result count alone when sections collapse or expand', () => {
    const counted = (collapse: CollapseState) => listCatalogue(index, browsing(), collapse).resultCount

    expect(counted(initialCollapseState(index))).toBe(counted(expandedCollapse()))
    expect(counted(collapsing(['hard-cheese', 'fish'], browsing()))).toBe(counted(expandedCollapse()))
  })

  it('never lists a category whose subtree holds no entry', () => {
    expect(sectionIds(listCatalogue(index, browsing(), expandedCollapse()))).not.toContain('snacks')
  })

  it('lists a 1,000-level branch without recursion', () => {
    const categories = Array.from({ length: 1000 }, (_, level) =>
      category(`level-${level}`, `Level ${level}`, level === 0 ? null : `level-${level - 1}`))
    const deepIndex = buildContentIndex({ categories, foods: [food('deep', 'level-999')], guidanceLists: [pregnancy] })

    const listing = listCatalogue(deepIndex, browsing(), expandedCollapse(deepIndex))

    expect(listing.sections).toHaveLength(1000)
    expect(listing.sections[999]).toMatchObject({ depth: 999, entryCount: 1 })
    expect(listing.sections[0].entryCount).toBe(1)
  })
})

describe('catalogue listing while filtering', () => {
  const searching = (query: string, guidanceListIds = ['pregnancy']): FoodFilterState =>
    ({ ...browsing(guidanceListIds), query })

  it('filters for a search, a category, or an outcome, but not for selected scopes alone', () => {
    const filteringFor = (filters: FoodFilterState) => listCatalogue(index, filters, initialCollapseState(index)).filtering

    expect(filteringFor(browsing(['pregnancy', 'vegetarian']))).toBe(false)
    expect(filteringFor(searching('cheddar'))).toBe(true)
    expect(filteringFor({ ...browsing(), categoryId: 'dairy' })).toBe(true)
    expect(filteringFor({ ...browsing(), outcomeBands: ['okay'] })).toBe(true)
  })

  it('opens every section holding a match, whatever the browse collapse state, and counts only matches', () => {
    const listing = listCatalogue(index, searching('parmesan'), initialCollapseState(index))

    expect(listing.sections.map(({ category: { id }, collapsed, entryCount }) => [id, collapsed, entryCount]))
      .toEqual([['dairy', false, 1], ['cheese', false, 1], ['hard-cheese', false, 1]])
    expect(listing.resultCount).toBe(1)
  })

  it('counts a matched category entry alongside the foods it holds', () => {
    // "Hard cheese" names the category's own guide entry and, through their path, both its foods.
    const listing = listCatalogue(index, searching('hard cheese'), initialCollapseState(index))

    expect(listing.resultCount).toBe(3)
    expect(sectionOf(listing, 'hard-cheese')!.entryCount).toBe(3)
  })

  it('hides a search-collapsed section without a chip, so no chip summarises a filtered subset', () => {
    const filters = searching('cheese')
    const listing = listCatalogue(index, filters, collapsing(['cheese'], filters, initialCollapseState(index)))

    expect(sectionIds(listing)).toEqual(['dairy', 'cheese'])
    expect(sectionOf(listing, 'cheese')).toMatchObject({ collapsed: true, chip: undefined })
  })

  it('chips nothing under an outcome filter', () => {
    const filters: FoodFilterState = { ...browsing(), outcomeBands: ['okay'] }
    const listing = listCatalogue(index, filters, collapsing(['cheese', 'juice'], filters, initialCollapseState(index)))

    expect(listing.sections.filter((section) => section.collapsed).map((section) => section.category.id))
      .toEqual(['cheese', 'juice'])
    expect(listing.sections.every((section) => section.chip === undefined)).toBe(true)
  })

  it('restores the browse collapse state once the filters clear', () => {
    const browse = collapsing(['fish'], browsing())
    const filtered = collapsing(['cheese'], searching('cheese'), browse)

    const listing = listCatalogue(index, browsing(), filtered)

    expect(sectionOf(listing, 'cheese')!.collapsed).toBe(false)
    expect(sectionOf(listing, 'fish')).toMatchObject({ collapsed: true, chip: 'maybe' })
  })
})

describe('catalogue listing guidance lists', () => {
  it('returns the selected lists in the content index order, whatever the input order', () => {
    const listed = (guidanceListIds: string[]) =>
      listCatalogue(index, browsing(guidanceListIds), initialCollapseState(index)).guidanceLists.map((list) => list.id)

    expect(listed(['vegetarian', 'pregnancy'])).toEqual(['pregnancy', 'vegetarian'])
    expect(listed(['vegetarian'])).toEqual(['vegetarian'])
  })
})

// ADR: Resolve guidance conservatively without inference.
// See: docs/decisions/2026-09-21 ADR - resolve guidance conservatively without inference.md
describe('catalogue listing never infers safety', () => {
  const bothScopes = browsing(['pregnancy', 'vegetarian'])
  const chipOf = (categoryId: string, filters: FoodFilterState) =>
    sectionOf(listCatalogue(index, filters, collapsing([categoryId], filters)), categoryId)!.chip

  it('chips a section nobody has assessed as not assessed, never as okay', () => {
    expect(chipOf('soft-drinks', bothScopes)).toBe('not-assessed')
  })

  it('reads silence on one list beside okay on another as a caution rather than okay', () => {
    expect(chipOf('juice', browsing())).toBe('okay')
    expect(chipOf('juice', bothScopes)).toBe('maybe')
  })
})

describe('catalogue listing over the guide content', () => {
  const defaultScopes = browsing(['pregnancy-food-safety', 'vegetarian-suitability'])
  const expandedGuide = () => expandedCollapse(contentIndex)

  it('lists root sections alphabetically', () => {
    const rootNames = listCatalogue(contentIndex, defaultScopes, initialCollapseState(contentIndex))
      .sections.map((section) => section.category.name)

    expect(rootNames).toEqual([...rootNames].sort((left, right) => left.localeCompare(right)))
  })

  it('lists ice cream under desserts rather than dairy, and fruit juice under drinks rather than miscellaneous', () => {
    const listing = listCatalogue(contentIndex, defaultScopes, expandedGuide())

    expect(sectionOf(listing, 'ice-cream')!.breadcrumb).not.toMatch(/^Dairy/)
    expect(sectionOf(listing, 'fruit-juice-kombucha-and-cider')).toMatchObject({
      breadcrumb: 'Drinks > Fruit juice, kombucha and cider (non-alcoholic)',
      depth: 1,
    })
  })

  it('lists a nested section after the ancestor headings above it, and headings with no foods of their own', () => {
    const ids = sectionIds(listCatalogue(contentIndex, defaultScopes, expandedGuide()))

    expect(ids.indexOf('cakes-slices-and-muffins')).toBeLessThan(ids.indexOf('plain-cakes-slices-and-muffins'))
    expect(ids).toEqual(expect.arrayContaining(['cheese', 'custard']))
  })

  it('chips Cereals as mixed, because Fresh filled pasta replaces the rule its siblings follow', () => {
    const listing = listCatalogue(contentIndex, defaultScopes, collapsing(['cereals'], defaultScopes, expandedGuide()))

    expect(sectionOf(listing, 'cereals')!.chip).toBe('maybe')
  })
})
