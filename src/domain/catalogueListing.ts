import { resolveAssessment, type AssessmentSubjectRef } from './assessment'
import { entriesSurfacedByDescendants, visibleCategoryRows } from './categoryTree'
import { combineOutcomesAcrossLists, summariseCollapsedRow, type CombinedOutcome } from './collapsedRowSummary'
import { collapsedCategoryIds, isFiltering, type CollapseState } from './collapseState'
import type { ContentIndex } from './contentIndex'
import { filterCategoryEntries, filterFoods, type FoodFilterState } from './filtering'
import type { Category, GuidanceList } from './schemas'

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

// ADR: Resolve guidance conservatively without inference.
// See: docs/decisions/2026-09-21 ADR - resolve guidance conservatively without inference.md
/**
 * What the catalogue lists for a query: which category sections appear, in what order, with which
 * counts and aggregate chips, and how many guide entries the query returned.
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

  const outcomeOf = (subjectRef: AssessmentSubjectRef, preparationId?: string): CombinedOutcome =>
    combineOutcomesAcrossLists(guidanceLists.map(
      (guidanceList) => resolveAssessment(subjectRef, guidanceList, index, preparationId).status.outcomeBand,
    ))
  const outcomesInCategory = new Map<string, CombinedOutcome[]>()
  const recordOutcome = (categoryId: string, outcome: CombinedOutcome) => {
    outcomesInCategory.set(categoryId, [...(outcomesInCategory.get(categoryId) ?? []), outcome])
  }
  for (const { category, preparationId } of entryRows) {
    recordOutcome(category.id, outcomeOf({ kind: 'category', category }, preparationId))
  }
  for (const { food, preparationId } of foodRows) {
    recordOutcome(food.primaryCategoryId, outcomeOf({ kind: 'food', food }, preparationId))
  }

  // Deepest first, so each category folds its children's already-folded outcomes in. Iterative
  // because the tree has no depth limit and a recursive walk would put that limit back. Every
  // category is visited before any parent that reads it, so a child's entry is always present.
  const outline = index.categoryOutline
  const outcomesInSubtree = new Map<string, CombinedOutcome[]>()
  for (let position = outline.length - 1; position >= 0; position -= 1) {
    const { category } = outline[position]
    const outcomes = [...(outcomesInCategory.get(category.id) ?? [])]
    for (const childId of index.tree.childIdsByParentId.get(category.id) ?? []) {
      outcomes.push(...outcomesInSubtree.get(childId)!)
    }
    outcomesInSubtree.set(category.id, outcomes)
  }

  const collapsedIds = collapsedCategoryIds(collapse, filters)
  // A category is listed when its subtree holds an entry, which keeps every ancestor of listed
  // content as a heading.
  const listedOutline = outline.filter(({ category }) => outcomesInSubtree.get(category.id)!.length > 0)
  const sections = visibleCategoryRows(listedOutline, collapsedIds).map(({ category, breadcrumb, depth }) => {
    const outcomes = outcomesInSubtree.get(category.id)!
    const collapsed = collapsedIds.has(category.id)
    // A chip must never summarise a filtered subset: searching `rice` narrows Cereals to one food,
    // and a chip folded over what survived would report the whole group as okay. A root group spans
    // too much of the catalogue for one chip to say anything useful, so it stays chip-free.
    const chip = collapsed && depth > 0 && !filtering ? summariseCollapsedRow(outcomes) : undefined
    return { category, breadcrumb, depth, collapsed, entryCount: outcomes.length, chip }
  })

  return {
    resultCount: foodRows.length + entryRows.length,
    filtering,
    guidanceLists,
    sections,
  }
}
