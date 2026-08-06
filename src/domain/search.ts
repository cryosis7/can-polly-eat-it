import type { CategoryTree } from './categoryTree'
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

export const foodSearchText = (food: Food, tree: CategoryTree) => {
  const categoryPath = tree.pathByCategoryId.get(food.primaryCategoryId) ?? []
  const categoryTerms = categoryPath.flatMap((category) => [category.name, ...category.aliases])

  return normaliseSearchText([food.name, ...food.aliases, ...categoryTerms].join(' '))
}

export const matchesSearchQuery = (food: Food, tree: CategoryTree, query: string) => {
  const tokens = searchTokens(query)
  if (tokens.length === 0) {
    return true
  }
  const searchableText = foodSearchText(food, tree)
  return tokens.every((token) => searchableText.includes(token))
}

export const categorySearchText = (category: Category, tree: CategoryTree) => {
  const categoryPath = tree.pathByCategoryId.get(category.id) ?? [category]
  return normaliseSearchText(categoryPath.flatMap((ancestor) => [ancestor.name, ...ancestor.aliases]).join(' '))
}

export const matchesCategoryQuery = (category: Category, tree: CategoryTree, query: string) => {
  const tokens = searchTokens(query)
  if (tokens.length === 0) {
    return true
  }
  const searchableText = categorySearchText(category, tree)
  return tokens.every((token) => searchableText.includes(token))
}
