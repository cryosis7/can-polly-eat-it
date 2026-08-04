import type { Category } from '../domain/schemas'

export const categories: Category[] = [
  { id: 'dairy', slug: 'dairy', name: 'Dairy', parentId: null, aliases: ['milk products'], sortOrder: 1 },
  { id: 'cheese', slug: 'cheese', name: 'Cheese', parentId: 'dairy', aliases: [], sortOrder: 1 },
  { id: 'hard-cheese', slug: 'hard-cheese', name: 'Hard cheese', parentId: 'cheese', aliases: [], sortOrder: 1 },
  { id: 'soft-cheese', slug: 'soft-cheese', name: 'Soft cheese', parentId: 'cheese', aliases: [], sortOrder: 2 },
  { id: 'prepared-foods', slug: 'prepared-foods', name: 'Prepared foods', parentId: null, aliases: [], sortOrder: 2 },
  { id: 'drinks', slug: 'drinks', name: 'Drinks', parentId: null, aliases: ['beverages'], sortOrder: 3 },
]
