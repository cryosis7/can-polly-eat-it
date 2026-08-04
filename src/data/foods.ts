import type { Food } from '../domain/schemas'

export const foods: Food[] = [
  { id: 'cheddar', slug: 'cheddar', name: 'Cheddar', aliases: ['cheddar cheese'], primaryCategoryId: 'hard-cheese', tags: [], sortOrder: 1 },
  { id: 'brie', slug: 'brie', name: 'Brie', aliases: ['soft-ripened cheese'], primaryCategoryId: 'soft-cheese', tags: [], sortOrder: 1 },
  { id: 'leftovers', slug: 'leftovers', name: 'Cooked leftovers', aliases: ['leftover food'], primaryCategoryId: 'prepared-foods', tags: [], sortOrder: 1 },
  { id: 'yoghurt', slug: 'yoghurt', name: 'Yoghurt', aliases: ['yogurt'], primaryCategoryId: 'dairy', tags: [], sortOrder: 1 },
  { id: 'kombucha', slug: 'kombucha', name: 'Kombucha', aliases: [], primaryCategoryId: 'drinks', tags: [], sortOrder: 1 },
]
