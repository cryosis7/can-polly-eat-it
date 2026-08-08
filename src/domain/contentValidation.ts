import {
  assessmentSchema,
  categorySchema,
  foodSchema,
  guidanceListSchema,
  type Assessment,
  type Category,
  type Food,
  type GuidanceList,
  type StatusDefinition,
} from './schemas'
import { createContentIndex, findAssessment, subjectKey, type ContentIndex } from './contentIndex'

export type ContentData = {
  categories: Category[]
  foods: Food[]
  guidanceLists: GuidanceList[]
  assessments: Assessment[]
}

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

const validateGuidanceLists = (guidanceLists: GuidanceList[]) => {
  assertUnique(guidanceLists.map((list) => list.id), 'guidance-list ID')
  assertUnique(guidanceLists.map((list) => list.slug), 'guidance-list slug')

  for (const list of guidanceLists) {
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
 * it adds to. Neutral bands never appear here, because a fallback status on an assessment is
 * already rejected.
 */
const validateAdditiveAssessment = (
  assessment: Assessment,
  guidanceList: GuidanceList,
  index: ContentIndex,
  foodsById: Map<string, Food>,
) => {
  const { subject } = assessment
  // Both references are already validated above, so the tree always holds the subject's path.
  const path = subject.kind === 'food'
    ? index.tree.pathByCategoryId.get(foodsById.get(subject.foodId)!.primaryCategoryId)!
    : index.tree.pathByCategoryId.get(subject.categoryId)!.slice(0, -1)

  for (let position = path.length - 1; position >= 0; position -= 1) {
    const inherited = findAssessment(index, guidanceList.id, { kind: 'category', categoryId: path[position].id })
    if (!inherited) {
      continue
    }
    const own = getStatusById(guidanceList, assessment.statusId)
    const target = getStatusById(guidanceList, inherited.statusId)
    if (restrictiveness[own.outcomeBand] < restrictiveness[target.outcomeBand]) {
      fail(`assessment "${assessment.id}" adds to guidance that is more restrictive than itself.`)
    }
    return
  }
  fail(`assessment "${assessment.id}" adds to inherited guidance, but no ancestor is assessed in its guidance list.`)
}

const validateAssessments = (
  assessments: Assessment[],
  foods: Food[],
  categories: Category[],
  guidanceLists: GuidanceList[],
  index: ContentIndex,
) => {
  assertUnique(assessments.map((assessment) => assessment.id), 'assessment ID')
  assertUnique(
    assessments.map((assessment) => `${subjectKey(assessment.subject)}:${assessment.guidanceListId}`),
    'subject/list assessment pair',
  )
  const foodIds = new Set(foods.map((food) => food.id))
  const categoryIds = new Set(categories.map((category) => category.id))
  const foodsById = new Map(foods.map((food) => [food.id, food]))
  const listsById = new Map(guidanceLists.map((list) => [list.id, list]))

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
      if (assessment.relation === 'adds-to') {
        validateAdditiveAssessment(assessment, guidanceList, index, foodsById)
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

export const validateContent = (rawContent: ContentData): ContentData => {
  const categories = rawContent.categories.map((record) => categorySchema.parse(record))
  const foods = rawContent.foods.map((record) => foodSchema.parse(record))
  const guidanceLists = rawContent.guidanceLists.map((record) => guidanceListSchema.parse(record))
  const assessments = rawContent.assessments.map((record) => assessmentSchema.parse(record))

  validateCategories(categories)
  const categoryIds = new Set(categories.map((category) => category.id))
  assertUnique(foods.map((food) => food.id), 'food ID')
  assertUnique(foods.map((food) => food.slug), 'food slug')
  if (foods.some((food) => !categoryIds.has(food.primaryCategoryId))) {
    fail('a food references an unknown primary category.')
  }
  validateGuidanceLists(guidanceLists)
  const index = createContentIndex(categories, assessments)
  validateAssessments(assessments, foods, categories, guidanceLists, index)
  return { categories, foods, guidanceLists, assessments }
}

export const getStatusById = (guidanceList: GuidanceList, statusId: string): StatusDefinition =>
  guidanceList.statuses.find((status) => status.id === statusId)
  ?? fail(`guidance list "${guidanceList.id}" does not own status "${statusId}".`)
