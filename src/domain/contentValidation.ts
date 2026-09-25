import {
  assessmentSchema,
  categorySchema,
  foodSchema,
  guidanceListSchema,
  preparationSchema,
  sourceSchema,
  type Assessment,
  type Category,
  type Food,
  type GuidanceList,
  type Preparation,
  type Source,
  type StatusDefinition,
} from './schemas'
import { createContentIndex, type ContentIndex } from './contentIndex'

export type ContentData = {
  categories: Category[]
  foods: Food[]
  preparations: Preparation[]
  sources: Source[]
  guidanceLists: GuidanceList[]
  assessments: Assessment[]
}

declare const validated: unique symbol

/** Content that has passed `validateContent`; the only input the content index is built from. */
export type ValidatedContent = ContentData & { readonly [validated]: true }

const fail = (message: string): never => {
  throw new Error(`Invalid guide content: ${message}`)
}

const assertUnique = (values: string[], label: string) => {
  if (new Set(values).size !== values.length) {
    fail(`duplicate ${label}.`)
  }
}

const validateCategories = (categories: Category[]) => {
  assertUnique(categories.map((category) => category.id), 'category ID')
  assertUnique(categories.map((category) => category.slug), 'category slug')
  const categoryIds = new Set(categories.map((category) => category.id))

  for (const category of categories) {
    if (category.parentId === category.id) {
      fail(`category "${category.id}" cannot be its own parent.`)
    }
    if (category.parentId !== null && !categoryIds.has(category.parentId)) {
      fail(`category "${category.id}" has an unknown parent.`)
    }
  }

  for (const category of categories) {
    const visited = new Set<string>()
    let current: Category | undefined = category
    while (current && current.parentId !== null) {
      if (visited.has(current.id)) {
        fail(`category "${category.id}" is part of a cycle.`)
      }
      visited.add(current.id)
      const parentId: string = current.parentId
      current = categories.find((candidate) => candidate.id === parentId)
    }
  }
}

const validateGuidanceLists = (guidanceLists: GuidanceList[], sources: Source[]) => {
  assertUnique(guidanceLists.map((list) => list.id), 'guidance-list ID')
  assertUnique(guidanceLists.map((list) => list.slug), 'guidance-list slug')
  const sourceIds = new Set(sources.map((source) => source.id))

  for (const list of guidanceLists) {
    assertUnique(list.sourceIds, `source reference in "${list.id}"`)
    for (const sourceId of list.sourceIds) {
      if (!sourceIds.has(sourceId)) {
        fail(`guidance list "${list.id}" references an unknown source.`)
      }
    }
    assertUnique(list.statuses.map((status) => status.id), `status ID in "${list.id}"`)
    assertUnique(list.statuses.map((status) => status.slug), `status slug in "${list.id}"`)
    assertUnique(list.statuses.map((status) => status.label), `status label in "${list.id}"`)

    const unassessedStatus = list.statuses.find((status) => status.id === list.unassessedStatusId)
    if (unassessedStatus?.tone !== 'grey' || unassessedStatus.outcomeBand !== 'not-assessed') {
      fail(`guidance list "${list.id}" must own a grey not-assessed fallback status.`)
    }

    if (list.citationPolicy === 'required') {
      if (list.unassessedNotice.citations.length === 0) {
        fail(`guidance list "${list.id}" requires citations, so its unassessed notice must include at least one citation.`)
      }
      if (list.evidentiaryBasis !== undefined) {
        fail(`guidance list "${list.id}" requires citations and must not declare an evidentiary basis.`)
      }
    } else if (list.evidentiaryBasis === undefined) {
      fail(`guidance list "${list.id}" has an optional citation policy and must declare an evidentiary basis.`)
    }
  }
}

const restrictiveness: Record<string, number> = { okay: 0, maybe: 1, 'not-okay': 2 }

/**
 * An additive assessment must have something to add to, and must not be less restrictive than what
 * it adds to. Comparison is within a source only: across sources the check would let one authority's
 * caution invalidate another authority's authored record, which is a veto rather than a coherence
 * check. Neutral bands never appear here, because a fallback status on an assessment is already
 * rejected.
 *
 * The search runs on the assessment's own preparation axis first, so a qualified assessment adds to
 * guidance that applies in that preparation. An unqualified assessment on a subject that declares
 * preparations may also add to guidance on those axes: a food-wide rule is restated on every
 * preparation row, so it demonstrably has something to add to even when no ancestor rule applies
 * however the subject is prepared. That is the shape the Bluff oyster serving limit takes once the
 * group's cooking rule becomes preparation-qualified — the limit still holds however they are eaten,
 * and it must not suppress the cooking rule on the row where that rule applies.
 */
const validateAdditiveAssessment = (
  assessment: Assessment,
  guidanceList: GuidanceList,
  index: ContentIndex,
) => {
  const { subject } = assessment
  // Both references are already validated above, so the lookups resolve and the tree always holds
  // the subject's path.
  const path = subject.kind === 'food'
    ? index.tree.pathByCategoryId.get(index.foodById(subject.foodId).primaryCategoryId)!
    : index.tree.pathByCategoryId.get(subject.categoryId)!.slice(0, -1)
  const declaredAxes = subject.kind === 'food' && assessment.preparationId === undefined
    ? index.foodById(subject.foodId).preparationIds
    : []

  let hasAncestorGuidance = false
  for (let position = path.length - 1; position >= 0; position -= 1) {
    const ancestors = index.assessmentsFor(
      guidanceList.id,
      { kind: 'category', categoryId: path[position].id },
      assessment.preparationId,
    )
    if (ancestors.length === 0) {
      continue
    }
    hasAncestorGuidance = true
    const sameSource = ancestors.find((candidate) => candidate.sourceId === assessment.sourceId)
    if (!sameSource) {
      continue
    }
    const own = getStatusById(guidanceList, assessment.statusId)
    const target = getStatusById(guidanceList, sameSource.statusId)
    if (restrictiveness[own.outcomeBand] < restrictiveness[target.outcomeBand]) {
      fail(`assessment "${assessment.id}" adds to guidance that is more restrictive than itself.`)
    }
    return
  }
  // Nothing to add to on its own axis. A food-wide rule on a food that declares preparations is
  // restated on every preparation row, so ancestor guidance on any declared axis is something it
  // demonstrably adds to. The restrictiveness comparison deliberately stays on the assessment's own
  // axis: across axes it compares rules about different things, and `combineAxes` already governs
  // each row with the more cautious of the two authored statuses.
  if (!hasAncestorGuidance) {
    hasAncestorGuidance = declaredAxes.some((preparationId) => path.some((ancestor) =>
      index.assessmentsFor(guidanceList.id, { kind: 'category', categoryId: ancestor.id }, preparationId).length > 0,
    ))
  }
  if (!hasAncestorGuidance) {
    fail(`assessment "${assessment.id}" adds to inherited guidance, but no ancestor is assessed in its guidance list.`)
  }
}

const validateSources = (sources: Source[]) => {
  assertUnique(sources.map((source) => source.id), 'source ID')
  assertUnique(sources.map((source) => source.slug), 'source slug')
}

const validatePreparations = (preparations: Preparation[]) => {
  assertUnique(preparations.map((preparation) => preparation.id), 'preparation ID')
  assertUnique(preparations.map((preparation) => preparation.slug), 'preparation slug')
}

/**
 * A preparation qualifier must name a state its subject is actually eaten in, so a source is never
 * recorded as having addressed a preparation the catalogue does not hold. For a category subject the
 * state must be declared by at least one food in that category or below it, since a category's
 * preparation dimension comes from its foods rather than from an authored list.
 */
const validatePreparationQualifier = (
  assessment: Assessment,
  index: ContentIndex,
  preparationIds: Set<string>,
) => {
  const { preparationId, subject } = assessment
  if (preparationId === undefined) {
    return
  }
  if (!preparationIds.has(preparationId)) {
    fail(`assessment "${assessment.id}" is qualified by an unknown preparation state.`)
  }
  if (subject.kind === 'food') {
    // The food reference is already validated above, so the lookup always resolves.
    if (!index.foodById(subject.foodId).preparationIds.includes(preparationId)) {
      fail(`assessment "${assessment.id}" is qualified by a preparation its food does not declare.`)
    }
  }
  // A category assessment needs no such check. A category is a first-class subject, so its own
  // guidance establishes a preparation grouping whether or not any food sits beneath it: `Ice cream`
  // holds three authored rules and no foods, and requiring a food to declare `soft-serve` would
  // reject the very content the grouping exists to show.
}

/**
 * Attribution is required only where it carries meaning. A list declaring two or more sources must
 * name one on every assessment; a single-source or no-source list supplies the attribution itself.
 */
const validateAttribution = (assessment: Assessment, guidanceList: GuidanceList) => {
  if (assessment.sourceId === undefined) {
    if (guidanceList.sourceIds.length > 1) {
      fail(`assessment "${assessment.id}" belongs to a guidance list with more than one source and must name its source.`)
    }
    return
  }
  if (!guidanceList.sourceIds.includes(assessment.sourceId)) {
    fail(`assessment "${assessment.id}" names a source that its guidance list does not declare.`)
  }
}

const validateAssessments = (assessments: Assessment[], index: ContentIndex) => {
  assertUnique(assessments.map((assessment) => assessment.id), 'assessment ID')
  assertUnique(
    assessments.map((assessment) => [
      JSON.stringify(assessment.subject),
      assessment.preparationId ?? '',
      assessment.guidanceListId,
      assessment.sourceId ?? '',
    ].join(':')),
    'subject/preparation/list/source assessment pair',
  )
  const foodIds = new Set(index.foods.map((food) => food.id))
  const categoryIds = new Set(index.categories.map((category) => category.id))
  const listsById = new Map(index.guidanceLists.map((list) => [list.id, list]))
  const preparationIds = new Set(index.preparations.map((preparation) => preparation.id))

  for (const assessment of assessments) {
    const { subject } = assessment
    if (subject.kind === 'food' && !foodIds.has(subject.foodId)) {
      fail(`assessment "${assessment.id}" references an unknown food.`)
    }
    if (subject.kind === 'category' && !categoryIds.has(subject.categoryId)) {
      fail(`assessment "${assessment.id}" references an unknown category.`)
    }
    if (subject.kind === 'category' && !assessment.scopeStatement) {
      fail(`assessment "${assessment.id}" is for a category subject and must declare a scopeStatement.`)
    }
    if (subject.kind === 'food' && assessment.scopeStatement) {
      fail(`assessment "${assessment.id}" is for a food subject and must not declare a scopeStatement.`)
    }
    validatePreparationQualifier(assessment, index, preparationIds)
    const guidanceList = listsById.get(assessment.guidanceListId)
    if (!guidanceList) {
      fail(`assessment "${assessment.id}" references an unknown guidance list.`)
    } else {
      const status = guidanceList.statuses.find((candidate) => candidate.id === assessment.statusId)
      if (!status || assessment.statusId === guidanceList.unassessedStatusId) {
        fail(`assessment "${assessment.id}" must use a non-fallback status owned by its guidance list.`)
      }
      if (guidanceList.citationPolicy === 'required' && assessment.citations.length === 0) {
        fail(`assessment "${assessment.id}" belongs to a guidance list that requires citations.`)
      }
      validateAttribution(assessment, guidanceList)
      if (assessment.relation === 'adds-to') {
        validateAdditiveAssessment(assessment, guidanceList, index)
      }
    }
    assertUnique(assessment.reasonLinks.map((link) => `${link.kind}:${link.targetFoodId}`), `reason link in "${assessment.id}"`)
    for (const link of assessment.reasonLinks) {
      const selfReference = subject.kind === 'food' && link.targetFoodId === subject.foodId
      if (!foodIds.has(link.targetFoodId) || selfReference) {
        fail(`assessment "${assessment.id}" has an invalid reason-link target.`)
      }
    }
  }
}

export const validateContent = (rawContent: ContentData): ValidatedContent => {
  const categories = rawContent.categories.map((record) => categorySchema.parse(record))
  const foods = rawContent.foods.map((record) => foodSchema.parse(record))
  const preparations = rawContent.preparations.map((record) => preparationSchema.parse(record))
  const sources = rawContent.sources.map((record) => sourceSchema.parse(record))
  const guidanceLists = rawContent.guidanceLists.map((record) => guidanceListSchema.parse(record))
  const assessments = rawContent.assessments.map((record) => assessmentSchema.parse(record))

  validateCategories(categories)
  const categoryIds = new Set(categories.map((category) => category.id))
  assertUnique(foods.map((food) => food.id), 'food ID')
  assertUnique(foods.map((food) => food.slug), 'food slug')
  if (foods.some((food) => !categoryIds.has(food.primaryCategoryId))) {
    fail('a food references an unknown primary category.')
  }
  validatePreparations(preparations)
  const preparationIds = new Set(preparations.map((preparation) => preparation.id))
  for (const food of foods) {
    assertUnique(food.preparationIds, `preparation state on food "${food.id}"`)
    if (food.preparationIds.some((preparationId) => !preparationIds.has(preparationId))) {
      fail(`food "${food.id}" declares an unknown preparation state.`)
    }
  }
  validateSources(sources)
  validateGuidanceLists(guidanceLists, sources)
  const content = { categories, foods, preparations, sources, guidanceLists, assessments } as ValidatedContent
  // Only assessments remain unchecked here. Building the index over them never throws, and the
  // lookups used below resolve only references already validated, so the brand is safe to assert
  // before the last step.
  validateAssessments(assessments, createContentIndex(content))
  return content
}

export const getStatusById = (guidanceList: GuidanceList, statusId: string): StatusDefinition =>
  guidanceList.statuses.find((status) => status.id === statusId)
  ?? fail(`guidance list "${guidanceList.id}" does not own status "${statusId}".`)
