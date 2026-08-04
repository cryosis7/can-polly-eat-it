import type { Category, Food, FoodAssessment, GuidanceList, StatusDefinition } from './schemas'
import { getStatusById, isFoodCovered } from './contentValidation'

export type ResolvedAssessment = {
  status: StatusDefinition
  assessment?: FoodAssessment
  isFallback: boolean
}

export const resolveAssessment = (
  food: Food,
  guidanceList: GuidanceList,
  assessments: FoodAssessment[],
  categories: Category[],
): ResolvedAssessment => {
  const assessment = assessments.find((candidate) =>
    candidate.foodId === food.id && candidate.guidanceListId === guidanceList.id,
  )
  if (assessment) {
    return { status: getStatusById(guidanceList, assessment.statusId), assessment, isFallback: false }
  }
  const statusId = isFoodCovered(food, guidanceList, categories)
    ? guidanceList.unassessedStatusId
    : guidanceList.outOfCoverageStatusId
  return { status: getStatusById(guidanceList, statusId), isFallback: true }
}
