import type { Category, Food } from './schemas'

export const normaliseSearchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')

export const searchTokens = (query: string) => normaliseSearchText(query).split(' ').filter(Boolean)

export const foodSearchText = (food: Food, categories: Category[]) => {
  const categoryById = new Map(categories.map((category) => [category.id, category]))
  const categoryTerms: string[] = []
  let category = categoryById.get(food.primaryCategoryId)

  while (category) {
    categoryTerms.push(category.name, ...category.aliases)
    category = category.parentId === null ? undefined : categoryById.get(category.parentId)
  }

  return normaliseSearchText([food.name, ...food.aliases, ...categoryTerms].join(' '))
}

export const matchesSearchQuery = (food: Food, categories: Category[], query: string) => {
  const tokens = searchTokens(query)
  if (tokens.length === 0) {
    return true
  }
  const searchableText = foodSearchText(food, categories)
  return tokens.every((token) => searchableText.includes(token))
}
