import type { Food } from '../domain/schemas'

type FoodDefinition = {
  id: string
  name: string
  aliases?: string[]
  /** The preparation states this food is eaten in. Absent means it has no preparation dimension. */
  preparations?: string[]
}

type FoodGroup = {
  categoryId: string
  foods: FoodDefinition[]
}

// ADR: Model preparation as a catalogue dimension.
// See: docs/decisions/2026-08-10 ADR - model preparation as a catalogue dimension.md
//
// Which seafood species are eaten raw and smoked in New Zealand. These are structural claims about
// how people eat, confirmed by the maintainer at the F-18 review gate; they carry no guidance and
// no source states them. The guidance shown against a preparation is the group's authored rule.
//
// Two tests decided each entry. Everyday practice counts and a fine-dining menu item does not, so
// commercial sale and home preparation count equally and every community's practice counts equally.
// And the question is only what people eat, never whether they should: a species is listed here
// even where eating it that way carries risk, because that is exactly the reader the guide serves.
const eatenRaw = new Set([
  'farmed-salmon', 'kingfish', 'snapper', 'trevally', 'kahawai', 'albacore-tuna', 'skipjack-tuna',
  'yellowfin-tuna', 'southern-bluefin-tuna', 'striped-marlin',
  'oysters', 'bluff-and-pacific-oysters', 'scallops', 'queen-scallops', 'mussels', 'arrow-squid',
  'rock-lobster',
])

const eatenSmoked = new Set([
  'farmed-salmon', 'eel', 'kahawai', 'mackerel', 'barracouta', 'sprats', 'albacore-tuna', 'warehou',
  'hoki', 'blue-cod', 'snapper', 'trevally', 'kingfish', 'hapuka-or-groper', 'tarakihi', 'red-cod',
  'monkfish-or-stargazer', 'rig',
  'brown-trout', 'rainbow-trout', 'lake-taupo-trout', 'lake-rotomahana-trout', 'geothermal-lake-trout',
  'mussels', 'oysters', 'bluff-and-pacific-oysters', 'arrow-squid',
])

/** Every seafood species in the guide is eaten cooked, so `cooked` is not a per-species judgement. */
const seafood = (definitions: FoodDefinition[]): FoodDefinition[] => definitions.map((definition) => ({
  ...definition,
  preparations: [
    ...(eatenRaw.has(definition.id) ? ['raw'] : []),
    ...(eatenSmoked.has(definition.id) ? ['smoked'] : []),
    'cooked',
  ],
}))

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
    categoryId: 'sprouts-and-enoki-mushrooms',
    foods: [
      { id: 'seed-sprouts', name: 'Seed sprouts', aliases: ['alfalfa sprouts', 'mung bean sprouts', 'lentil sprouts', 'chickpea sprouts', 'broccoli sprouts', 'radish sprouts', 'pea sprouts', 'snow pea sprouts', 'adzuki sprouts'] },
      { id: 'enoki-mushrooms', name: 'Enoki mushrooms' },
    ],
  },
  {
    categoryId: 'confectionery',
    foods: [
      { id: 'gummy-bears', name: 'Gummy bears' },
      { id: 'jelly', name: 'Jelly', aliases: ['jello'] },
      { id: 'marshmallows', name: 'Marshmallows' },
      { id: 'starburst', name: 'Starburst' },
    ],
  },
  {
    categoryId: 'ingredients-and-additives',
    foods: [
      { id: 'gelatin', name: 'Gelatin', aliases: ['gelatine'] },
      { id: 'white-sugar', name: 'White sugar' },
    ],
  },
  {
    categoryId: 'soups',
    foods: [
      { id: 'vegetable-soup', name: 'Vegetable soup', aliases: ['vegetable soups'] },
    ],
  },
  {
    categoryId: 'baked-desserts',
    foods: [
      { id: 'apple-pie', name: 'Apple pie' },
    ],
  },
  {
    categoryId: 'alcoholic-drinks',
    foods: [
      { id: 'wine-and-beer', name: 'Wine and beer', aliases: ['wine', 'beer'] },
    ],
  },
  {
    categoryId: 'fruit-juice-kombucha-and-cider',
    foods: [
      { id: 'orange-juice', name: 'Orange juice' },
    ],
  },
  {
    categoryId: 'breads',
    foods: [
      { id: 'tortillas', name: 'Tortillas' },
    ],
  },
  {
    categoryId: 'miscellaneous',
    foods: [
      { id: 'french-fries', name: 'French fries', aliases: ['chips'] },
    ],
  },
  {
    // The commercial and home-made sauce categories retired into preparation states, so each sauce
    // is filed once and declares the ways it is made. Mayonnaise declares both because the
    // catalogue already carried "commercial mayonnaise" as an alias of the commercial rule.
    categoryId: 'sauces-dressings-and-spreads',
    foods: [
      { id: 'mayonnaise', name: 'Mayonnaise', aliases: ['home-made mayonnaise', 'dressings containing mayonnaise'], preparations: ['home-made', 'store-bought'] },
      { id: 'hollandaise-sauce', name: 'Hollandaise sauce', aliases: ['hollandaise'], preparations: ['home-made'] },
      { id: 'caesar-dressing', name: 'Caesar dressing', preparations: ['home-made'] },
      { id: 'worcestershire-sauce', name: 'Worcestershire sauce', preparations: ['store-bought'] },
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
    categoryId: 'drinks',
    foods: [
      { id: 'eggnog', name: 'Eggnog', preparations: ['home-made'] },
      { id: 'egg-flips', name: 'Egg flips', preparations: ['home-made'] },
      { id: 'smoothies', name: 'Smoothies', preparations: ['home-made'] },
    ],
  },
  {
    categoryId: 'fish',
    foods: seafood([
      { id: 'anchovy', name: 'Anchovy' }, { id: 'barracouta', name: 'Barracouta' },
      { id: 'blue-cod', name: 'Blue cod' }, { id: 'brill-and-turbot', name: 'Brill and turbot' },
      { id: 'brown-trout', name: 'Brown trout', aliases: ['Lake Ellesmere brown trout'] },
      { id: 'eel', name: 'Eel', aliases: ['longfin eel', 'shortfin eel'] },
      { id: 'elephant-fish', name: 'Elephant fish' }, { id: 'flounders', name: 'Flounders' }, { id: 'gurnard', name: 'Gurnard' },
      { id: 'hoki', name: 'Hoki' }, { id: 'john-dory', name: 'John Dory' }, { id: 'ling', name: 'Ling' },
      { id: 'monkfish-or-stargazer', name: 'Monkfish or stargazer' },
      { id: 'orange-perch', name: 'Orange perch' }, { id: 'orange-roughy', name: 'Orange Roughy' }, { id: 'oreo-dories', name: 'Oreo dories' },
      { id: 'parore', name: 'Parore' },
      { id: 'rainbow-trout', name: 'Rainbow trout', aliases: ['geothermal rainbow trout'] }, { id: 'skipjack-tuna', name: 'Skipjack tuna' },
      { id: 'yellowfin-tuna', name: 'Yellowfin tuna' },
      { id: 'smooth-oreo', name: 'Smooth oreo' }, { id: 'sole', name: 'Sole', aliases: ['lemon sole'] }, { id: 'southern-blue-whiting', name: 'Southern blue whiting' },
      { id: 'tarakihi', name: 'Tarakihi' }, { id: 'toothfish', name: 'Antarctic toothfish' },
      { id: 'warehou', name: 'Warehou', aliases: ['common warehou', 'silver warehou', 'white warehou'] },
      { id: 'whitebait', name: 'Whitebait', aliases: ['inanga'] },
      { id: 'albacore-tuna', name: 'Albacore tuna' }, { id: 'alfonsino', name: 'Alfonsino' }, { id: 'bass', name: 'Bass' },
      { id: 'bluenose', name: 'Bluenose' }, { id: 'ghost-sharks', name: 'Ghost sharks' }, { id: 'hake', name: 'Hake' },
      { id: 'hapuka-or-groper', name: 'Hapuka or groper' }, { id: 'javelin-fish', name: 'Javelin fish' }, { id: 'kahawai', name: 'Kahawai' },
      { id: 'kingfish', name: 'Kingfish' }, { id: 'lake-taupo-trout', name: 'Lake Taupo trout' }, { id: 'leatherjacket', name: 'Leatherjacket' },
      { id: 'lemon-sole', name: 'Lemon sole' }, { id: 'mackerel', name: 'Mackerel', aliases: ['blue mackerel', 'jack mackerel'] },
      { id: 'red-cod', name: 'Red cod' }, { id: 'ribaldo', name: 'Ribaldo' }, { id: 'rig', name: 'Rig', aliases: ['lemonfish', 'spotted dogfish'] },
      { id: 'farmed-salmon', name: 'Farmed salmon' }, { id: 'sea-perch', name: 'Sea perch' },
      { id: 'silverside', name: 'Silverside' }, { id: 'skate', name: 'Skate' }, { id: 'snapper', name: 'Snapper' },
      { id: 'sprats', name: 'Sprats' }, { id: 'trevally', name: 'Trevally' },
      { id: 'cardinal-fish', name: 'Cardinal fish' }, { id: 'dogfish', name: 'Dogfish' }, { id: 'lake-rotomahana-trout', name: 'Lake Rotomahana trout' },
      { id: 'geothermal-lake-trout', name: 'Lake trout from geothermal regions' }, { id: 'school-shark', name: 'School shark', aliases: ['greyboy', 'tope'] },
      { id: 'striped-marlin', name: 'Striped marlin' }, { id: 'southern-bluefin-tuna', name: 'Southern bluefin tuna' }, { id: 'swordfish', name: 'Swordfish' },
    ]),
  },
  {
    categoryId: 'shellfish',
    foods: seafood([
      { id: 'arrow-squid', name: 'Arrow squid' },
      { id: 'cockles', name: 'Cockles' },
      { id: 'mussels', name: 'Mussels', aliases: ['green mussels', 'blue mussels'] },
      { id: 'oysters', name: 'Oysters' },
      { id: 'scallops', name: 'Scallops' },
      { id: 'surf-clams', name: 'Surf clams', aliases: ['tuatua'] },
      { id: 'bluff-and-pacific-oysters', name: 'Bluff and Pacific oysters' },
      { id: 'queen-scallops', name: 'Queen scallops' },
    ]),
  },
  {
    categoryId: 'crustacea',
    foods: seafood([
      { id: 'rock-lobster', name: 'Rock lobster' },
    ]),
  },
]

export const foods: Food[] = foodGroups.flatMap(({ categoryId, foods: groupFoods }) =>
  groupFoods.map(({ id, name, aliases, preparations }, index) => ({
    id,
    name,
    slug: id,
    aliases: aliases ?? [],
    primaryCategoryId: categoryId,
    preparationIds: preparations ?? [],
    tags: [],
    sortOrder: index + 1,
  })),
)
