import { findAssessments, type ContentIndex } from './contentIndex'
import { getStatusById } from './contentValidation'
import type { Assessment, Category, Food, GuidanceList, StatusDefinition } from './schemas'

export type AssessmentSubjectRef =
  | { kind: 'food', food: Food }
  | { kind: 'category', category: Category }

export type AssessmentOrigin =
  | { kind: 'own' }
  | { kind: 'inherited', category: Category }
  | { kind: 'not-assessed' }

export type GuidanceLayer = {
  assessment: Assessment
  origin: AssessmentOrigin
  /**
   * The authorities that stated this layer. Empty in a single-source or no-source list, where the
   * list itself supplies the attribution and no attribution is rendered.
   */
  sourceIds: string[]
  /**
   * Every citation behind this layer, including those of an identically worded statement collapsed
   * into it. Only citations are unioned; no authored text is ever merged.
   */
  citations: Assessment['citations']
}

/**
 * One source's whole position on a subject, present only where assessed sources disagree. Positions
 * are shown as competing alternatives, never stacked, because stacking contradictory instructions
 * would assert a combined regime no authority stated.
 */
export type GuidancePosition = {
  sourceId?: string
  status: StatusDefinition
  layers: GuidanceLayer[]
}

export type ResolvedAssessment = {
  status: StatusDefinition
  assessment?: Assessment
  origin: AssessmentOrigin
  /**
   * Every authored assessment that applies, broadest ancestor first and ending with the nearest
   * one. Length 1 unless an assessment declares `relation: 'adds-to'` or more than one source
   * assessed the subject, and empty when nothing applies. Layers are never merged; each keeps its
   * own summary, scenarios, and citations.
   */
  layers: GuidanceLayer[]
  /**
   * One position per source, present only where assessed sources reached different statuses. Empty
   * whenever the sources agree, so a single-source list never renders attribution machinery.
   */
  positions: GuidancePosition[]
}

export const isAdditive = (assessment: Assessment) => assessment.relation === 'adds-to'

/**
 * The wording to display for an assessment: the source's own where it authored one, otherwise the
 * list's canonical wording for that status. Nothing is synthesised, and no two authored statements
 * are ever combined into a third.
 */
export const assessmentSummary = (assessment: Assessment, guidanceList: GuidanceList): string =>
  assessment.summary ?? getStatusById(guidanceList, assessment.statusId).summary

const restrictiveness: Record<string, number> = { okay: 0, maybe: 1, 'not-okay': 2 }

type AssessedLevel = {
  origin: AssessmentOrigin
  assessments: Assessment[]
}

const toLayer = (assessment: Assessment, origin: AssessmentOrigin): GuidanceLayer => ({
  assessment,
  origin,
  sourceIds: assessment.sourceId === undefined ? [] : [assessment.sourceId],
  citations: assessment.citations,
})

/**
 * The authored body of an assessment, excluding its identity, its source, and its citations. Two
 * layers collapse into one only when these are exactly equal: near-identical wording is treated as
 * two statements, because showing a sentence twice is safer than attributing wording to an
 * authority that did not write it.
 */
const statementKey = (assessment: Assessment): string => JSON.stringify({
  statusId: assessment.statusId,
  summary: assessment.summary?.trim(),
  scopeStatement: assessment.scopeStatement?.trim(),
  relation: assessment.relation,
  guidanceScenarios: assessment.guidanceScenarios,
  reasonLinks: assessment.reasonLinks,
})

const collapseIdenticalStatements = (layers: GuidanceLayer[]): GuidanceLayer[] => {
  const collapsed: GuidanceLayer[] = []
  const byStatement = new Map<string, GuidanceLayer>()
  for (const layer of layers) {
    const key = statementKey(layer.assessment)
    const existing = byStatement.get(key)
    if (existing) {
      existing.sourceIds = [...existing.sourceIds, ...layer.sourceIds]
      existing.citations = [...existing.citations, ...layer.citations]
      continue
    }
    const merged = { ...layer }
    byStatement.set(key, merged)
    collapsed.push(merged)
  }
  return collapsed
}

/**
 * Walks towards the root collecting every assessed ancestor, whichever source stated it, and
 * stopping at and including the first level that replaces rather than adds to what it inherits.
 */
const collectAncestorLayers = (
  ancestors: Category[],
  guidanceList: GuidanceList,
  index: ContentIndex,
  from: number,
  preparationId?: string,
): GuidanceLayer[] => {
  const layers: GuidanceLayer[] = []
  for (let position = from; position >= 0; position -= 1) {
    const category = ancestors[position]
    const assessments = findAssessments(
      index,
      guidanceList.id,
      { kind: 'category', categoryId: category.id },
      preparationId,
    )
    if (assessments.length === 0) {
      continue
    }
    for (const assessment of assessments) {
      layers.push(toLayer(assessment, { kind: 'inherited', category }))
    }
    if (assessments.some((assessment) => !isAdditive(assessment))) {
      break
    }
  }
  return layers
}

/** The nearest subject level holding any assessment, and where the ancestor walk resumes above it. */
const findNearestLevel = (
  own: Assessment[],
  ancestors: Category[],
  guidanceList: GuidanceList,
  index: ContentIndex,
  preparationId?: string,
): { level: AssessedLevel, nextAncestor: number } | undefined => {
  if (own.length > 0) {
    return { level: { origin: { kind: 'own' }, assessments: own }, nextAncestor: ancestors.length - 1 }
  }
  for (let position = ancestors.length - 1; position >= 0; position -= 1) {
    const category = ancestors[position]
    const assessments = findAssessments(
      index,
      guidanceList.id,
      { kind: 'category', categoryId: category.id },
      preparationId,
    )
    if (assessments.length > 0) {
      return {
        level: { origin: { kind: 'inherited', category }, assessments },
        nextAncestor: position - 1,
      }
    }
  }
  return undefined
}

/**
 * The authored status that governs the chip, the outcome band, filtering, and the count. It is
 * selected from authored statuses by caution and never averaged, blended, or invented. Every
 * candidate sits at the same subject level, so a tie on caution falls to the order the list declares
 * its sources in: display determinism, not a ranking, since both positions are shown and named.
 */
const governingAssessment = (assessments: Assessment[], guidanceList: GuidanceList): Assessment =>
  [...assessments].sort((left, right) => {
    const byCaution = restrictiveness[getStatusById(guidanceList, right.statusId).outcomeBand]
      - restrictiveness[getStatusById(guidanceList, left.statusId).outcomeBand]
    // A level holding more than one assessment can only exist in a list declaring more than one
    // source, where validation requires every assessment to name one, so the comparator never
    // compares an unattributed assessment.
    return byCaution === 0
      ? guidanceList.sourceIds.indexOf(left.sourceId!) - guidanceList.sourceIds.indexOf(right.sourceId!)
      : byCaution
  })[0]

/**
 * The one assessment per source whose status counts on this row. Where a source authored both a
 * preparation-qualified assessment and an unqualified one at the same level, the qualified one
 * governs, because the source deliberately said something more specific about this preparation.
 * This is nearest-subject-first extended along the preparation axis, not a merge: the unqualified
 * assessment is still rendered as its own layer.
 */
const statusBearingAssessments = (assessments: Assessment[]): Assessment[] => {
  const bySource = new Map<string, Assessment>()
  for (const assessment of assessments) {
    const key = assessment.sourceId ?? ''
    const existing = bySource.get(key)
    if (!existing || assessment.preparationId !== undefined) {
      bySource.set(key, assessment)
    }
  }
  return [...bySource.values()]
}

/** Broadest first within a level: unqualified guidance holds however the subject is prepared. */
const byBreadth = (assessments: Assessment[]): Assessment[] => [
  ...assessments.filter((assessment) => assessment.preparationId === undefined),
  ...assessments.filter((assessment) => assessment.preparationId !== undefined),
]

const resolveWithAncestors = (
  own: Assessment[],
  ancestors: Category[],
  guidanceList: GuidanceList,
  index: ContentIndex,
  preparationId?: string,
): ResolvedAssessment => {
  const nearest = findNearestLevel(own, ancestors, guidanceList, index, preparationId)

  if (!nearest) {
    return {
      status: getStatusById(guidanceList, guidanceList.unassessedStatusId),
      origin: { kind: 'not-assessed' },
      layers: [],
      positions: [],
    }
  }

  const { level, nextAncestor } = nearest
  const levelAssessments = byBreadth(level.assessments)
  const inherited = levelAssessments.every(isAdditive)
    ? collectAncestorLayers(ancestors, guidanceList, index, nextAncestor, preparationId)
    : []
  const statusBearing = statusBearingAssessments(levelAssessments)
  const governing = governingAssessment(statusBearing, guidanceList)
  const contested = new Set(statusBearing.map((assessment) => assessment.statusId)).size > 1

  const positions: GuidancePosition[] = contested
    ? statusBearing.map((assessment) => ({
      sourceId: assessment.sourceId,
      status: getStatusById(guidanceList, assessment.statusId),
      layers: (isAdditive(assessment)
        ? [...collectAncestorLayers(ancestors, guidanceList, index, nextAncestor, preparationId)].reverse()
        : []
      ).concat(
        levelAssessments
          .filter((candidate) => candidate.sourceId === assessment.sourceId)
          .map((candidate) => toLayer(candidate, level.origin)),
      ),
    }))
    : []

  return {
    status: getStatusById(guidanceList, governing.statusId),
    assessment: governing,
    origin: level.origin,
    layers: collapseIdenticalStatements(
      [...inherited].reverse().concat(levelAssessments.map((assessment) => toLayer(assessment, level.origin))),
    ),
    positions,
  }
}

// ADR: Model catalogue subjects and preparation independently.
// See: docs/decisions/2026-09-21 ADR - model catalogue subjects and preparation independently.md
/** Resolves one axis: food-wide guidance without a preparation, that preparation's guidance with one. */
const resolveOnAxis = (
  subjectRef: AssessmentSubjectRef,
  guidanceList: GuidanceList,
  index: ContentIndex,
  preparationId?: string,
): ResolvedAssessment => {
  if (subjectRef.kind === 'food') {
    const { food } = subjectRef
    return resolveWithAncestors(
      findAssessments(index, guidanceList.id, { kind: 'food', foodId: food.id }, preparationId),
      index.tree.pathByCategoryId.get(food.primaryCategoryId) ?? [],
      guidanceList,
      index,
      preparationId,
    )
  }

  const { category } = subjectRef
  return resolveWithAncestors(
    findAssessments(index, guidanceList.id, { kind: 'category', categoryId: category.id }, preparationId),
    (index.tree.pathByCategoryId.get(category.id) ?? []).slice(0, -1),
    guidanceList,
    index,
    preparationId,
  )
}

/**
 * Combines the two axes into one answer for a row. Food-wide guidance is stated first, because it
 * holds however the subject is prepared, and the preparation's own guidance follows it. Nothing is
 * merged: every layer keeps its own wording, scope statement, and citations, and the governing
 * status is always one an authority authored, chosen by caution alone.
 */
const combineAxes = (
  foodWide: ResolvedAssessment,
  prepared: ResolvedAssessment,
): ResolvedAssessment => {
  if (prepared.layers.length === 0) {
    return foodWide
  }
  if (foodWide.layers.length === 0) {
    return prepared
  }

  const candidates = [foodWide, prepared]
  const governingSide = restrictiveness[prepared.status.outcomeBand] >= restrictiveness[foodWide.status.outcomeBand]
    ? prepared
    : foodWide
  const positionsBySource = new Map<string | undefined, GuidancePosition>()

  for (const side of candidates) {
    const sidePositions = side.positions.length > 0
      ? side.positions
      : [{ sourceId: side.assessment!.sourceId, status: side.status, layers: side.layers }]
    for (const position of sidePositions) {
      const existing = positionsBySource.get(position.sourceId)
      positionsBySource.set(position.sourceId, existing === undefined ? position : {
        sourceId: position.sourceId,
        status: restrictiveness[position.status.outcomeBand] >= restrictiveness[existing.status.outcomeBand]
          ? position.status
          : existing.status,
        layers: [...existing.layers, ...position.layers],
      })
    }
  }

  const positions = [...positionsBySource.values()]
  const contested = new Set(positions.map((position) => position.status.id)).size > 1

  return {
    status: governingSide.status,
    assessment: governingSide.assessment,
    origin: governingSide.origin,
    layers: collapseIdenticalStatements([...foodWide.layers, ...prepared.layers]),
    positions: contested ? positions : [],
  }
}

export const resolveAssessment = (
  subjectRef: AssessmentSubjectRef,
  guidanceList: GuidanceList,
  index: ContentIndex,
  preparationId?: string,
): ResolvedAssessment => {
  const foodWide = resolveOnAxis(subjectRef, guidanceList, index)
  if (preparationId === undefined) {
    return foodWide
  }
  return combineAxes(foodWide, resolveOnAxis(subjectRef, guidanceList, index, preparationId))
}
