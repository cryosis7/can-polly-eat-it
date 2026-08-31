import type { Category } from '../domain/schemas'

/**
 * Root categories are ordered alphabetically by name so every root's position is
 * predictable. Ordering inside a root stays authored, because a child's order often
 * carries meaning the alphabet would destroy.
 *
 * ADR: Model preparation as a catalogue dimension.
 * See: docs/decisions/2026-08-10 ADR - model preparation as a catalogue dimension.md
 *
 * Categories that split a food group by how it is prepared, processed, or sourced no longer exist
 * here. `Raw eggs` and `Cooked eggs` were never two kinds of food; they were one food in two states,
 * and the tree could only say so by duplicating the group. Those levels are now preparation
 * qualifiers on the surviving parent's assessments, so a food is filed once and its guidance is
 * scoped by state. Aliases the retired levels carried have moved onto the surviving parent, so no
 * search term stops working.
 */
export const categories: Category[] = [
  { id: 'breads-and-cereals', slug: 'breads-and-cereals', name: 'Breads and cereals', parentId: null, aliases: [], sortOrder: 1 },
  { id: 'breads', slug: 'breads', name: 'Breads', parentId: 'breads-and-cereals', aliases: [], sortOrder: 1 },
  { id: 'cakes-slices-and-muffins', slug: 'cakes-slices-and-muffins', name: 'Cakes, slices and muffins', parentId: 'breads-and-cereals', aliases: [], sortOrder: 2 },
  { id: 'plain-cakes-slices-and-muffins', slug: 'plain-cakes-slices-and-muffins', name: 'Plain cakes, slices and muffins', parentId: 'cakes-slices-and-muffins', aliases: [], sortOrder: 1 },
  { id: 'cakes-slices-and-muffins-with-cream-or-custard', slug: 'cakes-slices-and-muffins-with-cream-or-custard', name: 'Cakes, slices and muffins with added cream or custard', parentId: 'cakes-slices-and-muffins', aliases: [], sortOrder: 2 },
  { id: 'cereals', slug: 'cereals', name: 'Cereals', parentId: 'breads-and-cereals', aliases: [], sortOrder: 3 },
  { id: 'confectionery', slug: 'confectionery', name: 'Confectionery', parentId: null, aliases: [], sortOrder: 2 },
  { id: 'dairy', slug: 'dairy', name: 'Dairy', parentId: null, aliases: ['milk products', 'raw milk', 'raw dairy'], sortOrder: 3 },
  { id: 'cheese', slug: 'cheese', name: 'Cheese', parentId: 'dairy', aliases: [], sortOrder: 1 },
  { id: 'low-acid-soft-pasteurised-cheese', slug: 'low-acid-soft-pasteurised-cheese', name: 'Low-acid soft pasteurised cheese', parentId: 'cheese', aliases: [], sortOrder: 1 },
  { id: 'hard-cheese', slug: 'hard-cheese', name: 'Hard cheese', parentId: 'cheese', aliases: [], sortOrder: 2 },
  { id: 'pasteurised-cottage-and-cream-cheese', slug: 'pasteurised-cottage-and-cream-cheese', name: 'Pasteurised cottage cheese, cream cheese, etc', parentId: 'cheese', aliases: [], sortOrder: 3 },
  { id: 'butter', slug: 'butter', name: 'Butter', parentId: 'dairy', aliases: [], sortOrder: 2 },
  { id: 'cream', slug: 'cream', name: 'Cream', parentId: 'dairy', aliases: ['sour cream', 'whipped cream'], sortOrder: 3 },
  { id: 'custard', slug: 'custard', name: 'Custard', parentId: 'dairy', aliases: [], sortOrder: 4 },
  { id: 'milk', slug: 'milk', name: 'Milk', parentId: 'dairy', aliases: [], sortOrder: 5 },
  { id: 'yoghurt', slug: 'yoghurt', name: 'Yoghurt', parentId: 'dairy', aliases: ['yogurt', 'pasteurised yogurt'], sortOrder: 7 },
  { id: 'desserts', slug: 'desserts', name: 'Desserts', parentId: null, aliases: [], sortOrder: 4 },
  { id: 'cold-desserts', slug: 'cold-desserts', name: 'Cold desserts', parentId: 'desserts', aliases: ['chilled desserts'], sortOrder: 1 },
  { id: 'baked-desserts', slug: 'baked-desserts', name: 'Baked desserts', parentId: 'desserts', aliases: [], sortOrder: 2 },
  { id: 'ice-cream', slug: 'ice-cream', name: 'Ice cream', parentId: 'cold-desserts', aliases: [], sortOrder: 1 },
  { id: 'drinks', slug: 'drinks', name: 'Drinks', parentId: null, aliases: ['beverages'], sortOrder: 5 },
  { id: 'fruit-juice-kombucha-and-cider', slug: 'fruit-juice-kombucha-and-cider', name: 'Fruit juice, kombucha and cider (non-alcoholic)', parentId: 'drinks', aliases: ['pasteurised juice', 'pasteurised kombucha', 'pasteurised cider', 'raw fruit juice', 'raw kombucha', 'raw cider', 'raw juice'], sortOrder: 1 },
  { id: 'tea', slug: 'tea', name: 'Tea', parentId: 'drinks', aliases: ['teas', 'brew', 'cuppa', 'infusion'], sortOrder: 2 },
  // Tea splits on what the leaf is, not on how it is brewed, because that is the split every source
  // makes: caffeine governs one branch and unstudied plant compounds govern the other.
  { id: 'caffeinated-tea', slug: 'caffeinated-tea', name: 'Caffeinated tea', parentId: 'tea', aliases: ['non-herbal tea', 'true tea', 'Camellia sinensis', 'iced tea', 'English breakfast', 'Earl Grey', 'Orange Pekoe'], sortOrder: 1 },
  { id: 'herbal-tea', slug: 'herbal-tea', name: 'Herbal tea', parentId: 'tea', aliases: ['tisane', 'herbal infusion', 'herbal teas'], sortOrder: 2 },
  { id: 'alcoholic-drinks', slug: 'alcoholic-drinks', name: 'Alcoholic drinks', parentId: 'drinks', aliases: [], sortOrder: 3 },
  { id: 'fermented-drinks', slug: 'fermented-drinks', name: 'Fermented drinks', parentId: 'drinks', aliases: ['kvass', 'kefir', 'ginger beer'], sortOrder: 4 },
  { id: 'eggs', slug: 'eggs', name: 'Eggs', parentId: null, aliases: ['Raw eggs and foods containing raw eggs', 'uncooked eggs', 'runny eggs', 'fried eggs', 'scrambled eggs', 'poached eggs'], sortOrder: 6 },
  { id: 'ingredients-and-additives', slug: 'ingredients-and-additives', name: 'Ingredients and additives', parentId: null, aliases: [], sortOrder: 7 },
  { id: 'meat-and-poultry', slug: 'meat-and-poultry', name: 'Meat and poultry', parentId: null, aliases: ['Cooked meat and poultry', 'beef', 'pork', 'chicken', 'mince', 'sausages', 'ham', 'salami', 'luncheon', 'pate', 'pastrami', 'biltong', 'jerky', 'cold chicken', 'cold turkey', 'Raw meat and poultry', 'raw meat', 'raw chicken', 'raw beef', 'raw pork'], sortOrder: 8 },
  { id: 'seafood', slug: 'seafood', name: 'Seafood', parentId: null, aliases: ['fish and shellfish', 'Chilled smoked or pre-cooked seafood', 'smoked fish', 'smoked shellfish', 'cold smoked fish', 'Freshly cooked seafood', 'freshly cooked fish', 'freshly cooked shellfish'], sortOrder: 10 },
  { id: 'fish', slug: 'fish', name: 'Fish', parentId: 'seafood', aliases: ['marinated raw fish', 'raw fish'], sortOrder: 1 },
  { id: 'shellfish', slug: 'shellfish', name: 'Shellfish', parentId: 'seafood', aliases: ['marinated raw mussels', 'raw shellfish'], sortOrder: 2 },
  { id: 'crustacea', slug: 'crustacea', name: 'Crustacea', parentId: 'seafood', aliases: [], sortOrder: 3 },
  { id: 'fruit-and-vegetables', slug: 'fruit-and-vegetables', name: 'Vegetables, salads and fruits', parentId: null, aliases: ['fruit and vegetables'], sortOrder: 12 },
  { id: 'fruit', slug: 'fruit', name: 'Fruit', parentId: 'fruit-and-vegetables', aliases: ['whole melon', 'fresh fruits'], sortOrder: 1 },
  { id: 'vegetables', slug: 'vegetables', name: 'Vegetables', parentId: 'fruit-and-vegetables', aliases: [], sortOrder: 2 },
  { id: 'salads', slug: 'salads', name: 'Salads', parentId: 'fruit-and-vegetables', aliases: ['deli salads', 'coleslaw', 'pasta salad', 'rice salad', 'fruit salad'], sortOrder: 3 },
  { id: 'herbs', slug: 'herbs', name: 'Herbs', parentId: 'fruit-and-vegetables', aliases: ['fresh home-grown herbs', 'store-bought fresh herbs'], sortOrder: 4 },
  { id: 'miscellaneous', slug: 'miscellaneous', name: 'Miscellaneous', parentId: null, aliases: [], sortOrder: 9 },
  { id: 'leftovers', slug: 'leftovers', name: 'Leftovers', parentId: 'miscellaneous', aliases: [], sortOrder: 1 },
  { id: 'leftover-cooked-foods', slug: 'leftover-cooked-foods', name: 'Cooked foods', parentId: 'leftovers', aliases: ['Leftover cooked foods', 'cooked leftovers', 'leftover food'], sortOrder: 1 },
  { id: 'canned-foods', slug: 'canned-foods', name: 'Canned foods', parentId: 'miscellaneous', aliases: ['canned fruit', 'canned vegetables', 'canned fish'], sortOrder: 2 },
  { id: 'sauces-dressings-and-spreads', slug: 'sauces-dressings-and-spreads', name: 'Sauces, dressings and spreads', parentId: 'miscellaneous', aliases: ['commercial mayonnaise', 'tomato sauce', 'home-made dressings'], sortOrder: 3 },
  { id: 'sushi', slug: 'sushi', name: 'Sushi', parentId: 'miscellaneous', aliases: [], sortOrder: 4 },
  { id: 'stuffing', slug: 'stuffing', name: 'Stuffing', parentId: 'miscellaneous', aliases: ['Chicken or turkey stuffing'], sortOrder: 5 },
  { id: 'hummus-and-tahini-dips', slug: 'hummus-and-tahini-dips', name: 'Hummus and other dips containing tahini', parentId: 'miscellaneous', aliases: ['hummus', 'tahini dips'], sortOrder: 6 },
  { id: 'seaweed', slug: 'seaweed', name: 'Seaweed', parentId: 'miscellaneous', aliases: [], sortOrder: 7 },
  { id: 'brown-seaweed', slug: 'brown-seaweed', name: 'Brown seaweed', parentId: 'seaweed', aliases: ['kelp', 'kombu', 'wakame', 'arame', 'quandai-cai', 'hijiki', 'Sargassum fusiforme'], sortOrder: 1 },
  { id: 'red-and-green-seaweed', slug: 'red-and-green-seaweed', name: 'Red or green seaweed', parentId: 'seaweed', aliases: ['Red and green seaweed', 'nori', 'karengo', 'dulse'], sortOrder: 2 },
  { id: 'sprouts-and-enoki-mushrooms', slug: 'sprouts-and-enoki-mushrooms', name: 'Sprouts and enoki mushrooms', parentId: 'miscellaneous', aliases: ['Seed sprouts and enoki mushrooms'], sortOrder: 8 },
  { id: 'soy-products', slug: 'soy-products', name: 'Soy products', parentId: 'miscellaneous', aliases: ['soya products', 'soy'], sortOrder: 9 },
  { id: 'soups', slug: 'soups', name: 'Soups', parentId: null, aliases: [], sortOrder: 11 },
]
