import type { Food } from '../domain/schemas'

export const foods: Food[] = [
  { id: 'cheddar', slug: 'cheddar', name: 'Cheddar', aliases: ['cheddar cheese'], primaryCategoryId: 'hard-cheese', tags: [], sortOrder: 1 },
  { id: 'parmesan', slug: 'parmesan', name: 'Parmesan', aliases: ['parmigiano-reggiano'], primaryCategoryId: 'hard-cheese', tags: [], sortOrder: 2 },
  { id: 'brie', slug: 'brie', name: 'Brie', aliases: ['soft-ripened cheese'], primaryCategoryId: 'soft-cheese', tags: [], sortOrder: 1 },
  { id: 'yoghurt', slug: 'yoghurt', name: 'Yoghurt', aliases: ['yogurt'], primaryCategoryId: 'dairy', tags: [], sortOrder: 1 },
  { id: 'leftovers', slug: 'leftovers', name: 'Cooked leftovers', aliases: ['leftover food'], primaryCategoryId: 'prepared-foods', tags: [], sortOrder: 1 },
  { id: 'apple-pie', slug: 'apple-pie', name: 'Apple pie', aliases: [], primaryCategoryId: 'prepared-foods', tags: [], sortOrder: 2 },
  { id: 'french-fries', slug: 'french-fries', name: 'French fries', aliases: ['chips'], primaryCategoryId: 'prepared-foods', tags: [], sortOrder: 3 },
  { id: 'gummy-bears', slug: 'gummy-bears', name: 'Gummy bears', aliases: [], primaryCategoryId: 'prepared-foods', tags: [], sortOrder: 4 },
  { id: 'jelly', slug: 'jelly', name: 'Jelly', aliases: ['jello'], primaryCategoryId: 'prepared-foods', tags: [], sortOrder: 5 },
  { id: 'marshmallows', slug: 'marshmallows', name: 'Marshmallows', aliases: [], primaryCategoryId: 'prepared-foods', tags: [], sortOrder: 6 },
  { id: 'panna-cotta', slug: 'panna-cotta', name: 'Panna cotta', aliases: [], primaryCategoryId: 'prepared-foods', tags: [], sortOrder: 7 },
  { id: 'starburst', slug: 'starburst', name: 'Starburst', aliases: [], primaryCategoryId: 'prepared-foods', tags: [], sortOrder: 8 },
  { id: 'tortillas', slug: 'tortillas', name: 'Tortillas', aliases: [], primaryCategoryId: 'prepared-foods', tags: [], sortOrder: 9 },
  { id: 'vegetable-soup', slug: 'vegetable-soup', name: 'Vegetable soup', aliases: ['vegetable soups'], primaryCategoryId: 'prepared-foods', tags: [], sortOrder: 10 },
  { id: 'white-sugar', slug: 'white-sugar', name: 'White sugar', aliases: [], primaryCategoryId: 'prepared-foods', tags: [], sortOrder: 11 },
  { id: 'worcestershire-sauce', slug: 'worcestershire-sauce', name: 'Worcestershire sauce', aliases: [], primaryCategoryId: 'prepared-foods', tags: [], sortOrder: 12 },
  { id: 'kombucha', slug: 'kombucha', name: 'Kombucha', aliases: [], primaryCategoryId: 'drinks', tags: [], sortOrder: 1 },
  { id: 'orange-juice', slug: 'orange-juice', name: 'Orange juice', aliases: [], primaryCategoryId: 'drinks', tags: [], sortOrder: 2 },
  { id: 'wine-and-beer', slug: 'wine-and-beer', name: 'Wine and beer', aliases: ['wine', 'beer'], primaryCategoryId: 'drinks', tags: [], sortOrder: 3 },
]
