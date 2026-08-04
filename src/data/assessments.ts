import type { FoodAssessment } from '../domain/schemas'

const mpiCitation = {
  title: 'MPI: Food and pregnancy',
  url: 'https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy/',
  accessedOn: '2026-08-04',
}

export const assessments: FoodAssessment[] = [
  {
    id: 'cheddar-pregnancy',
    foodId: 'cheddar',
    guidanceListId: 'pregnancy-food-safety',
    statusId: 'pregnancy-ok',
    summary: 'Hard cheese is included in the reviewed guidance.',
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [{ ...mpiCitation, locator: 'Dairy products: hard cheese' }],
    reviewedOn: '2026-08-04',
  },
  {
    id: 'brie-pregnancy',
    foodId: 'brie',
    guidanceListId: 'pregnancy-food-safety',
    statusId: 'pregnancy-avoid',
    summary: 'Avoid soft-ripened cheese unless it is thoroughly cooked.',
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [{ ...mpiCitation, locator: 'Dairy products: soft-ripened cheese' }],
    reviewedOn: '2026-08-04',
  },
  {
    id: 'leftovers-pregnancy',
    foodId: 'leftovers',
    guidanceListId: 'pregnancy-food-safety',
    statusId: 'pregnancy-conditions',
    summary: 'Reheat leftovers until steaming hot before eating.',
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [{ ...mpiCitation, locator: 'Prepared foods: leftovers' }],
    reviewedOn: '2026-08-04',
  },
]
