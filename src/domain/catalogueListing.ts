import { resolveAssessment, type AssessmentSubjectRef, type ResolvedAssessment } from './assessment'
import { sortByEditorialOrder, type CatalogueRow, type CategoryRow, type CategoryTree } from './categoryTree'
import { combineOutcomesAcrossLists, summariseCollapsedRow, type CombinedOutcome } from './collapsedRowSummary'
import {
  collapsedCategoryIds,
  isBandCollapsed,
  isFiltering,
  preparationBandKey,
  type CollapseState,
  type PreparationBandKey,
} from './collapseState'
import type { ContentIndex } from './contentIndex'
import { filterCategoryEntries, filterFoods, type FoodFilterState } from './filtering'
import type { Category, Food, GuidanceList, Preparation } from './schemas'

/** A subject resolved in one selected guidance list. */
export type ListResolution = {
  guidanceList: GuidanceList
  resolved: ResolvedAssessment
}

/** A guide entry resolved in every selected guidance list, in the content index's list order. */
export type ListedGuidance = {
  resolved: readonly ListResolution[]
}

export type ListedFood = ListedGuidance & {
  food: Food
}

/** A category shown in one preparation state, beneath the category's own heading. */
export type PreparationBand = {
  key: PreparationBandKey
  preparation: Preparation
  collapsed: boolean
  /** Entries in the band, or only its matches while filtering. */
  entryCount: number
  /** Present only on a collapsed band while not filtering. */
  chip?: CombinedOutcome
  /**
   * The band's category resolved for this preparation in each selected list where an assessment
   * was found. It may be authored on an ancestor, because a source can state one rule for all
   * seafood while the species are filed under what they are.
   */
  governingRules: readonly ListResolution[]
  /** The category holds its own guide entry for this preparation, rather than only inheriting one. */
  hasOwnEntry: boolean
  /** Foods declaring this preparation, in editorial order; empty while the band is collapsed. */
  foods: readonly ListedFood[]
}

/** One category heading the catalogue renders, with what its collapse would hide. */
export type CatalogueSection = {
  category: Category
  breadcrumb: string
  /** 0 for a root category. */
  depth: number
  collapsed: boolean
  /** Guide entries in the whole subtree, or only its matches while filtering. */
  entryCount: number
  /** Present only on a collapsed, non-root section while not filtering. */
  chip?: CombinedOutcome
  /** The category's own guidance on no particular preparation; absent while collapsed. */
  ownEntry?: ListedGuidance
  /** Foods declaring no preparation, in editorial order; empty while collapsed. */
  unpreparedFoods: readonly ListedFood[]
  /** In preparation vocabulary order; empty while collapsed. */
  bands: readonly PreparationBand[]
}

/** Everything the catalogue renders for one query and collapse state. */
export type CatalogueListing = {
  /** Food rows and category entry rows listed, however much of them is collapsed. */
  resultCount: number
  /** A search, category, or outcome filter is active; selected scopes alone are not filtering. */
  filtering: boolean
  /** The selected guidance lists, in the content index's order whatever the input order. */
  guidanceLists: readonly GuidanceList[]
  /** Flat and depth-first in editorial order, so rendering needs no recursion and no depth limit. */
  sections: readonly CatalogueSection[]
}

type ByPreparation<T> = Map<string | undefined, T>

/**
 * The entry rows whose guidance is already stated where its foods are.
 *
 * A rule may be authored higher in the tree than the foods it governs: one "smoked seafood" rule
 * covers fish, shellfish and crustacea, while the species are filed under what they are. Rendering
 * that rule on the parent leaves a band holding a rule and no foods, directly above the bands
 * holding the foods and no rule. Where a descendant band states the rule alongside the foods, the
 * parent's own band is redundant.
 *
 * Only a parent with no rows of its own in that preparation is dropped: a category that lists foods
 * beside its rule is stating it exactly where it applies.
 */
const entriesSurfacedByDescendants = (
  entryRows: readonly CategoryRow[],
  foodRows: readonly CatalogueRow[],
  tree: CategoryTree,
): Set<CategoryRow> => {
  const preparationsWithRows = new Map<string, Set<string>>()
  for (const { food, preparationId } of foodRows) {
    if (preparationId === undefined) {
      continue
    }
    const preparations = preparationsWithRows.get(food.primaryCategoryId) ?? new Set<string>()
    preparations.add(preparationId)
    preparationsWithRows.set(food.primaryCategoryId, preparations)
  }

  const surfaced = new Set<CategoryRow>()
  for (const entryRow of entryRows) {
    const { category, preparationId } = entryRow
    if (preparationId === undefined || preparationsWithRows.get(category.id)?.has(preparationId)) {
      continue
    }
    const descendantIds = [...(tree.childIdsByParentId.get(category.id) ?? [])]
    let statedBelow = false
    while (descendantIds.length > 0 && !statedBelow) {
      const descendantId = descendantIds.pop()!
      statedBelow = preparationsWithRows.get(descendantId)?.has(preparationId) ?? false
      descendantIds.push(...(tree.childIdsByParentId.get(descendantId) ?? []))
    }
    if (statedBelow) {
      surfaced.add(entryRow)
    }
  }

  return surfaced
}

/** Rows grouped by the category they list under, then by preparation, keeping their input order. */
const groupedByCategory = <Row extends { preparationId?: string }>(
  rows: readonly Row[],
  categoryIdOf: (row: Row) => string,
): Map<string, ByPreparation<Row[]>> => {
  const grouped = new Map<string, ByPreparation<Row[]>>()
  for (const row of rows) {
    const groups = grouped.get(categoryIdOf(row)) ?? new Map<string | undefined, Row[]>()
    const group = groups.get(row.preparationId) ?? []
    group.push(row)
    groups.set(row.preparationId, group)
    grouped.set(categoryIdOf(row), groups)
  }
  return grouped
}

// ADR: Resolve guidance conservatively without inference.
// See: docs/decisions/2026-09-21 ADR - resolve guidance conservatively without inference.md
/**
 * What the catalogue lists for a query: which category sections and preparation bands appear, in
 * what order, with which resolved guidance, counts, and aggregate chips, and how many guide entries
 * the query returned.
 */
export const listCatalogue = (
  index: ContentIndex,
  filters: FoodFilterState,
  collapse: CollapseState,
): CatalogueListing => {
  const selectedIds = new Set(filters.guidanceListIds)
  const guidanceLists = index.guidanceLists.filter((list) => selectedIds.has(list.id))
  const filtering = isFiltering(filters)

  const foodRows = filterFoods(index, filters)
  const matchedEntryRows = filterCategoryEntries(index, filters)
  // A rule authored above the foods it governs is stated at the head of each band that holds them,
  // so the parent's own food-less band would repeat it directly above them. It is dropped from the
  // sections and the count together.
  const surfacedBelow = entriesSurfacedByDescendants(matchedEntryRows, foodRows, index.tree)
  const entryRows = matchedEntryRows.filter((row) => !surfacedBelow.has(row))

  const resolveInEachList = (subjectRef: AssessmentSubjectRef, preparationId?: string): ListResolution[] =>
    guidanceLists.map((guidanceList) => ({
      guidanceList,
      resolved: resolveAssessment(subjectRef, guidanceList, index, preparationId),
    }))
  const outcomeOf = ({ resolved }: ListedGuidance): CombinedOutcome =>
    combineOutcomesAcrossLists(resolved.map((resolution) => resolution.resolved.status.outcomeBand))

  // Each listed row is resolved once, and that one resolution both renders and folds into chips.
  const foodsIn = new Map<string, ByPreparation<ListedFood[]>>()
  for (const [categoryId, groups] of groupedByCategory(foodRows, ({ food }) => food.primaryCategoryId)) {
    foodsIn.set(categoryId, new Map([...groups].map(([preparationId, rows]) => [
      preparationId,
      sortByEditorialOrder(rows.map(({ food }) => food))
        .map((food) => ({ food, resolved: resolveInEachList({ kind: 'food', food }, preparationId) })),
    ])))
  }
  // A category yields at most one entry row per preparation, so each group holds exactly one.
  const entriesIn = new Map<string, ByPreparation<ListedGuidance>>()
  for (const [categoryId, groups] of groupedByCategory(entryRows, ({ category }) => category.id)) {
    entriesIn.set(categoryId, new Map([...groups].map(([preparationId, [{ category }]]) => [
      preparationId,
      { resolved: resolveInEachList({ kind: 'category', category }, preparationId) },
    ])))
  }

  // Deepest first, so each category folds its children's already-folded outcomes in. Iterative
  // because the tree has no depth limit and a recursive walk would put that limit back. Every
  // category is visited before any parent that reads it, so a child's entry is always present.
  const outline = index.categoryOutline
  const outcomesInSubtree = new Map<string, CombinedOutcome[]>()
  for (let position = outline.length - 1; position >= 0; position -= 1) {
    const { category } = outline[position]
    const outcomes = [
      ...[...(entriesIn.get(category.id)?.values() ?? [])].map(outcomeOf),
      ...[...(foodsIn.get(category.id)?.values() ?? [])].flat().map(outcomeOf),
    ]
    for (const childId of index.tree.childIdsByParentId.get(category.id) ?? []) {
      outcomes.push(...outcomesInSubtree.get(childId)!)
    }
    outcomesInSubtree.set(category.id, outcomes)
  }

  // A chip must never summarise a filtered subset: searching `rice` narrows Cereals to one food,
  // and a chip folded over what survived would report the whole group as okay.
  const chipFor = (collapsed: boolean, outcomes: CombinedOutcome[]) =>
    collapsed && !filtering ? summariseCollapsedRow(outcomes) : undefined

  const bandsOf = (
    category: Category,
    foods: ByPreparation<ListedFood[]>,
    entries: ByPreparation<ListedGuidance>,
  ): PreparationBand[] => index.preparationStatesFor(category.id)
    // A category's own guidance creates a band just as a food's declaration does, so a retired
    // preparation category stays browsable after its rule moves onto its parent, even where no food
    // declares that state.
    .filter((preparation) => foods.has(preparation.id) || entries.has(preparation.id))
    .map((preparation) => {
      const key = preparationBandKey(category.id, preparation.id)
      const collapsed = isBandCollapsed(collapse, key, filters)
      const ownEntry = entries.get(preparation.id)
      const bandFoods = foods.get(preparation.id) ?? []
      const listed = ownEntry === undefined ? bandFoods : [ownEntry, ...bandFoods]
      const governing = ownEntry?.resolved ?? resolveInEachList({ kind: 'category', category }, preparation.id)
      return {
        key,
        preparation,
        collapsed,
        entryCount: listed.length,
        chip: chipFor(collapsed, listed.map(outcomeOf)),
        governingRules: governing.filter(({ resolved }) => resolved.assessment !== undefined),
        hasOwnEntry: ownEntry !== undefined,
        foods: collapsed ? [] : bandFoods,
      }
    })

  const collapsedIds = collapsedCategoryIds(collapse, filters)
  // A category is listed when its subtree holds an entry, which keeps every ancestor of listed
  // content as a heading, and while no ancestor of it is collapsed.
  const listedOutline = outline.filter(({ category, ancestorIds }) =>
    outcomesInSubtree.get(category.id)!.length > 0 && !ancestorIds.some((ancestorId) => collapsedIds.has(ancestorId)))
  const sections = listedOutline.map(({ category, breadcrumb, depth }): CatalogueSection => {
    const outcomes = outcomesInSubtree.get(category.id)!
    const collapsed = collapsedIds.has(category.id)
    // A root group spans too much of the catalogue for one chip to say anything useful.
    const heading = { category, breadcrumb, depth, collapsed, entryCount: outcomes.length, chip: chipFor(collapsed && depth > 0, outcomes) }
    // Collapsing a category hides its own guidance too, exactly as collapsing a band hides its
    // callout, so the chip is the row's whole answer.
    if (collapsed) {
      return { ...heading, unpreparedFoods: [], bands: [] }
    }
    const foods: ByPreparation<ListedFood[]> = foodsIn.get(category.id) ?? new Map()
    const entries: ByPreparation<ListedGuidance> = entriesIn.get(category.id) ?? new Map()
    return {
      ...heading,
      ownEntry: entries.get(undefined),
      unpreparedFoods: foods.get(undefined) ?? [],
      bands: bandsOf(category, foods, entries),
    }
  })

  return {
    resultCount: foodRows.length + entryRows.length,
    filtering,
    guidanceLists,
    sections,
  }
}
