import type { Food } from '../domain/schemas'

type FoodDefinition = {
  id: string
  name: string
  aliases?: string[]
}

type FoodGroup = {
  categoryId: string
  foods: FoodDefinition[]
}

const foodGroups: FoodGroup[] = [
  {
    categoryId: 'cereals',
    foods: [
      { id: 'breakfast-cereals', name: 'Breakfast cereals', aliases: ['cereal', 'cereals'] },
      { id: 'rice', name: 'Rice' },
      { id: 'pasta', name: 'Pasta' },
      { id: 'fresh-filled-pasta', name: 'Fresh filled pasta', aliases: ['fresh pasta with filling'] },
    ],
  },
  {
    categoryId: 'low-acid-soft-pasteurised-cheese',
    foods: [
      { id: 'brie', name: 'Brie' },
      { id: 'camembert', name: 'Camembert' },
      { id: 'blue-cheese', name: 'Blue cheese' },
      { id: 'ricotta', name: 'Ricotta' },
      { id: 'mozzarella', name: 'Mozzarella' },
      { id: 'feta', name: 'Feta' },
      { id: 'halloumi', name: 'Halloumi' },
      { id: 'paneer', name: 'Paneer' },
    ],
  },
  {
    categoryId: 'hard-cheese',
    foods: [
      { id: 'cheddar', name: 'Cheddar', aliases: ['cheddar cheese'] },
      { id: 'parmesan', name: 'Parmesan', aliases: ['parmigiano-reggiano'] },
      { id: 'gouda', name: 'Gouda' },
    ],
  },
  {
    categoryId: 'pasteurised-cottage-and-cream-cheese',
    foods: [
      { id: 'cottage-cheese', name: 'Pasteurised cottage cheese' },
      { id: 'cream-cheese', name: 'Pasteurised cream cheese' },
    ],
  },
  {
    categoryId: 'freshly-cooked-seafood',
    foods: [
      { id: 'bluff-and-pacific-oysters', name: 'Bluff and Pacific oysters' },
      { id: 'queen-scallops', name: 'Queen scallops' },
    ],
  },
  {
    categoryId: 'sprouts-and-enoki-mushrooms',
    foods: [
      { id: 'seed-sprouts', name: 'Seed sprouts', aliases: ['alfalfa sprouts', 'mung bean sprouts', 'lentil sprouts', 'chickpea sprouts', 'broccoli sprouts', 'radish sprouts', 'pea sprouts', 'snow pea sprouts', 'adzuki sprouts'] },
      { id: 'enoki-mushrooms', name: 'Enoki mushrooms' },
    ],
  },
  {
    categoryId: 'foods-that-may-contain-animal-derived-ingredients',
    foods: [
      { id: 'apple-pie', name: 'Apple pie' },
      { id: 'french-fries', name: 'French fries', aliases: ['chips'] },
      { id: 'gelatin', name: 'Gelatin', aliases: ['gelatine'] },
      { id: 'gummy-bears', name: 'Gummy bears' },
      { id: 'jelly', name: 'Jelly', aliases: ['jello'] },
      { id: 'marshmallows', name: 'Marshmallows' },
      { id: 'orange-juice', name: 'Orange juice' },
      { id: 'starburst', name: 'Starburst' },
      { id: 'tortillas', name: 'Tortillas' },
      { id: 'vegetable-soup', name: 'Vegetable soup', aliases: ['vegetable soups'] },
      { id: 'white-sugar', name: 'White sugar' },
      { id: 'wine-and-beer', name: 'Wine and beer', aliases: ['wine', 'beer'] },
      { id: 'worcestershire-sauce', name: 'Worcestershire sauce' },
    ],
  },
  {
    categoryId: 'home-made-sauces',
    foods: [
      { id: 'mayonnaise', name: 'Mayonnaise', aliases: ['home-made mayonnaise', 'dressings containing mayonnaise'] },
      { id: 'hollandaise-sauce', name: 'Hollandaise sauce', aliases: ['hollandaise'] },
      { id: 'caesar-dressing', name: 'Caesar dressing' },
    ],
  },
  {
    categoryId: 'cold-desserts',
    foods: [
      { id: 'mousse', name: 'Mousse' },
      { id: 'tiramisu', name: 'Tiramisu' },
      { id: 'panna-cotta', name: 'Panna cotta' },
    ],
  },
  {
    categoryId: 'home-made-drinks',
    foods: [
      { id: 'eggnog', name: 'Eggnog' },
      { id: 'egg-flips', name: 'Egg flips' },
      { id: 'smoothies', name: 'Smoothies' },
    ],
  },
  {
    categoryId: 'fish-mercury-guidance',
    foods: [
      { id: 'anchovy', name: 'Anchovy' }, { id: 'arrow-squid', name: 'Arrow squid' }, { id: 'barracouta', name: 'Barracouta' },
      { id: 'blue-cod', name: 'Blue cod' }, { id: 'brill-and-turbot', name: 'Brill and turbot' }, { id: 'brown-trout', name: 'Brown trout', aliases: ['Lake Ellesmere brown trout'] },
      { id: 'cockles', name: 'Cockles' }, { id: 'eel', name: 'Eel', aliases: ['longfin eel', 'shortfin eel'] },
      { id: 'elephant-fish', name: 'Elephant fish' }, { id: 'flounders', name: 'Flounders' }, { id: 'gurnard', name: 'Gurnard' },
      { id: 'hoki', name: 'Hoki' }, { id: 'john-dory', name: 'John Dory' }, { id: 'ling', name: 'Ling' },
      { id: 'monkfish-or-stargazer', name: 'Monkfish or stargazer' }, { id: 'mussels', name: 'Mussels', aliases: ['green mussels', 'blue mussels'] },
      { id: 'orange-perch', name: 'Orange perch' }, { id: 'orange-roughy', name: 'Orange Roughy' }, { id: 'oreo-dories', name: 'Oreo dories' },
      { id: 'oysters', name: 'Oysters' }, { id: 'parore', name: 'Parore' }, { id: 'scallops', name: 'Scallops' },
      { id: 'rainbow-trout', name: 'Rainbow trout', aliases: ['geothermal rainbow trout'] }, { id: 'skipjack-tuna', name: 'Skipjack tuna' },
      { id: 'yellowfin-tuna', name: 'Yellowfin tuna' },
      { id: 'smooth-oreo', name: 'Smooth oreo' }, { id: 'sole', name: 'Sole', aliases: ['lemon sole'] }, { id: 'southern-blue-whiting', name: 'Southern blue whiting' },
      { id: 'surf-clams', name: 'Surf clams', aliases: ['tuatua'] }, { id: 'tarakihi', name: 'Tarakihi' }, { id: 'toothfish', name: 'Antarctic toothfish' },
      { id: 'warehou', name: 'Warehou', aliases: ['common warehou', 'silver warehou', 'white warehou'] },
      { id: 'whitebait', name: 'Whitebait', aliases: ['inanga'] },
      { id: 'albacore-tuna', name: 'Albacore tuna' }, { id: 'alfonsino', name: 'Alfonsino' }, { id: 'bass', name: 'Bass' },
      { id: 'bluenose', name: 'Bluenose' }, { id: 'ghost-sharks', name: 'Ghost sharks' }, { id: 'hake', name: 'Hake' },
      { id: 'hapuka-or-groper', name: 'Hapuka or groper' }, { id: 'javelin-fish', name: 'Javelin fish' }, { id: 'kahawai', name: 'Kahawai' },
      { id: 'kingfish', name: 'Kingfish' }, { id: 'lake-taupo-trout', name: 'Lake Taupo trout' }, { id: 'leatherjacket', name: 'Leatherjacket' },
      { id: 'lemon-sole', name: 'Lemon sole' }, { id: 'mackerel', name: 'Mackerel', aliases: ['blue mackerel', 'jack mackerel'] },
      { id: 'red-cod', name: 'Red cod' }, { id: 'ribaldo', name: 'Ribaldo' }, { id: 'rig', name: 'Rig', aliases: ['lemonfish', 'spotted dogfish'] },
      { id: 'rock-lobster', name: 'Rock lobster' }, { id: 'farmed-salmon', name: 'Farmed salmon' }, { id: 'sea-perch', name: 'Sea perch' },
      { id: 'silverside', name: 'Silverside' }, { id: 'skate', name: 'Skate' }, { id: 'snapper', name: 'Snapper' },
      { id: 'sprats', name: 'Sprats' }, { id: 'trevally', name: 'Trevally' },
      { id: 'cardinal-fish', name: 'Cardinal fish' }, { id: 'dogfish', name: 'Dogfish' }, { id: 'lake-rotomahana-trout', name: 'Lake Rotomahana trout' },
      { id: 'geothermal-lake-trout', name: 'Lake trout from geothermal regions' }, { id: 'school-shark', name: 'School shark', aliases: ['greyboy', 'tope'] },
      { id: 'striped-marlin', name: 'Striped marlin' }, { id: 'southern-bluefin-tuna', name: 'Southern bluefin tuna' }, { id: 'swordfish', name: 'Swordfish' },
    ],
  },
]

export const foods: Food[] = foodGroups.flatMap(({ categoryId, foods: groupFoods }) =>
  groupFoods.map((food, index) => ({
    ...food,
    slug: food.id,
    aliases: food.aliases ?? [],
    primaryCategoryId: categoryId,
    tags: [],
    sortOrder: index + 1,
  })),
)
