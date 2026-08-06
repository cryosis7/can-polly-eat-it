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
    categoryId: 'breads',
    foods: [
      { id: 'breads', name: 'Breads' },
    ],
  },
  {
    categoryId: 'plain-cakes-slices-and-muffins',
    foods: [{ id: 'plain-cakes-slices-and-muffins', name: 'Plain cakes, slices and muffins' }],
  },
  {
    categoryId: 'cakes-slices-and-muffins-with-cream-or-custard',
    foods: [{ id: 'cakes-slices-and-muffins-with-cream-or-custard', name: 'Cakes, slices and muffins with cream or custard' }],
  },
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
    categoryId: 'butter',
    foods: [{ id: 'butter', name: 'Butter' }],
  },
  {
    categoryId: 'cream',
    foods: [{ id: 'cream', name: 'Cream', aliases: ['sour cream', 'whipped cream'] }],
  },
  {
    categoryId: 'ready-made-chilled-custard',
    foods: [{ id: 'ready-made-chilled-custard', name: 'Ready-made chilled custard' }],
  },
  {
    categoryId: 'home-made-custard',
    foods: [{ id: 'home-made-custard', name: 'Home-made custard' }],
  },
  {
    categoryId: 'pasteurised-milk',
    foods: [{ id: 'pasteurised-milk', name: 'Pasteurised milk' }],
  },
  {
    categoryId: 'unpasteurised-milk-and-dairy-products',
    foods: [{ id: 'unpasteurised-milk-and-dairy-products', name: 'Unpasteurised milk and dairy products', aliases: ['raw milk', 'raw dairy'] }],
  },
  {
    categoryId: 'packaged-ice-cream',
    foods: [{ id: 'packaged-ice-cream', name: 'Packaged ice cream' }],
  },
  {
    categoryId: 'soft-serve-ice-cream',
    foods: [{ id: 'soft-serve-ice-cream', name: 'Soft-serve ice cream' }],
  },
  {
    categoryId: 'pasteurised-yoghurt',
    foods: [{ id: 'pasteurised-yoghurt', name: 'Pasteurised yoghurt', aliases: ['pasteurised yogurt', 'yoghurt', 'yogurt'] }],
  },
  {
    categoryId: 'raw-eggs',
    foods: [
      { id: 'raw-eggs-and-raw-egg-foods', name: 'Raw eggs and foods containing raw eggs', aliases: ['eggnog', 'egg flips', 'smoothies', 'home-made mayonnaise', 'home-made ice cream', 'mousse', 'tiramisu'] },
    ],
  },
  {
    categoryId: 'cooked-eggs',
    foods: [
      { id: 'cooked-eggs', name: 'Cooked eggs', aliases: ['fried eggs', 'scrambled eggs', 'poached eggs'] },
    ],
  },
  {
    categoryId: 'cooked-meats',
    foods: [
      { id: 'cooked-meat-and-poultry', name: 'Cooked meat and poultry', aliases: ['beef', 'pork', 'chicken', 'mince', 'sausages'] },
    ],
  },
  {
    categoryId: 'processed-meats',
    foods: [
      { id: 'processed-meats', name: 'Processed meats', aliases: ['ham', 'salami', 'luncheon', 'pate', 'pastrami', 'biltong', 'jerky'] },
    ],
  },
  {
    categoryId: 'cold-cooked-poultry',
    foods: [
      { id: 'cold-cooked-poultry', name: 'Cold cooked poultry', aliases: ['cold chicken', 'cold turkey'] },
    ],
  },
  {
    categoryId: 'raw-meat',
    foods: [
      { id: 'raw-meat-and-poultry', name: 'Raw meat and poultry', aliases: ['raw meat', 'raw chicken', 'raw beef', 'raw pork'] },
    ],
  },
  {
    categoryId: 'raw-fish',
    foods: [
      { id: 'raw-fish', name: 'Raw fish', aliases: ['marinated raw fish'] },
    ],
  },
  {
    categoryId: 'raw-shellfish',
    foods: [
      { id: 'raw-shellfish', name: 'Raw shellfish', aliases: ['marinated raw mussels'] },
    ],
  },
  {
    categoryId: 'smoked-seafood',
    foods: [
      { id: 'chilled-smoked-or-pre-cooked-seafood', name: 'Chilled smoked or pre-cooked seafood', aliases: ['smoked fish', 'smoked shellfish', 'cold smoked fish'] },
    ],
  },
  {
    categoryId: 'freshly-cooked-seafood',
    foods: [
      { id: 'freshly-cooked-seafood', name: 'Freshly cooked seafood', aliases: ['freshly cooked fish', 'freshly cooked shellfish'] },
      { id: 'bluff-and-pacific-oysters', name: 'Bluff and Pacific oysters' },
      { id: 'queen-scallops', name: 'Queen scallops' },
    ],
  },
  {
    categoryId: 'fresh-fruit',
    foods: [
      { id: 'fresh-fruit', name: 'Fresh fruit', aliases: ['whole melon', 'fresh fruits'] },
    ],
  },
  {
    categoryId: 'imported-frozen-berries',
    foods: [
      { id: 'imported-frozen-berries', name: 'Imported frozen berries' },
    ],
  },
  {
    categoryId: 'fresh-vegetables',
    foods: [
      { id: 'fresh-vegetables', name: 'Fresh vegetables' },
    ],
  },
  {
    categoryId: 'frozen-vegetables',
    foods: [
      { id: 'frozen-vegetables', name: 'Frozen vegetables' },
    ],
  },
  {
    categoryId: 'pre-packaged-and-ready-made-salads',
    foods: [
      { id: 'pre-packaged-and-ready-made-salads', name: 'Pre-packaged and ready-made salads', aliases: ['deli salads', 'coleslaw', 'pasta salad', 'rice salad', 'fruit salad'] },
    ],
  },
  {
    categoryId: 'home-made-salads',
    foods: [
      { id: 'home-made-salads', name: 'Home-made salads' },
    ],
  },
  {
    categoryId: 'dried-herbs',
    foods: [
      { id: 'dried-herbs', name: 'Dried herbs' },
    ],
  },
  {
    categoryId: 'fresh-herbs',
    foods: [
      { id: 'fresh-herbs', name: 'Fresh herbs', aliases: ['fresh home-grown herbs', 'store-bought fresh herbs'] },
    ],
  },
  {
    categoryId: 'leftover-cooked-foods',
    foods: [
      { id: 'leftover-cooked-foods', name: 'Leftover cooked foods', aliases: ['cooked leftovers', 'leftover food'] },
    ],
  },
  {
    categoryId: 'canned-foods',
    foods: [
      { id: 'canned-foods', name: 'Canned foods', aliases: ['canned fruit', 'canned vegetables', 'canned fish'] },
    ],
  },
  {
    categoryId: 'sauces-dressings-and-spreads',
    foods: [
      { id: 'commercial-sauces-dressings-and-spreads', name: 'Commercial sauces, dressings and spreads', aliases: ['commercial mayonnaise', 'tomato sauce'] },
    ],
  },
  {
    categoryId: 'store-bought-sushi',
    foods: [
      { id: 'store-bought-sushi', name: 'Store-bought sushi' },
    ],
  },
  {
    categoryId: 'home-made-sushi',
    foods: [
      { id: 'home-made-sushi', name: 'Home-made sushi' },
    ],
  },
  {
    categoryId: 'stuffing',
    foods: [
      { id: 'chicken-or-turkey-stuffing', name: 'Chicken or turkey stuffing' },
    ],
  },
  {
    categoryId: 'hummus-and-tahini-dips',
    foods: [
      { id: 'hummus-and-tahini-dips', name: 'Hummus and other dips containing tahini', aliases: ['hummus', 'tahini dips'] },
    ],
  },
  {
    categoryId: 'brown-seaweed',
    foods: [
      { id: 'brown-seaweed', name: 'Brown seaweed', aliases: ['kelp', 'kombu', 'wakame', 'arame', 'quandai-cai', 'hijiki', 'Sargassum fusiforme'] },
    ],
  },
  {
    categoryId: 'red-and-green-seaweed',
    foods: [
      { id: 'red-and-green-seaweed', name: 'Red and green seaweed', aliases: ['nori', 'karengo', 'dulse'] },
    ],
  },
  {
    categoryId: 'sprouts-and-enoki-mushrooms',
    foods: [
      { id: 'seed-sprouts-and-enoki-mushrooms', name: 'Seed sprouts and enoki mushrooms', aliases: ['alfalfa sprouts', 'mung bean sprouts', 'lentil sprouts', 'chickpea sprouts', 'broccoli sprouts', 'radish sprouts', 'pea sprouts', 'snow pea sprouts', 'adzuki sprouts', 'enoki mushrooms'] },
    ],
  },
  {
    categoryId: 'pasteurised-fruit-juice-kombucha-and-cider',
    foods: [
      { id: 'pasteurised-fruit-juice-kombucha-and-cider', name: 'Pasteurised fruit juice, kombucha and cider', aliases: ['pasteurised juice', 'pasteurised kombucha', 'pasteurised cider'] },
    ],
  },
  {
    categoryId: 'unpasteurised-fruit-juice-kombucha-and-cider',
    foods: [
      { id: 'unpasteurised-fruit-juice-kombucha-and-cider', name: 'Unpasteurised fruit juice, kombucha and cider', aliases: ['raw juice', 'raw kombucha', 'raw cider'] },
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
      { id: 'panna-cotta', name: 'Panna cotta' },
      { id: 'starburst', name: 'Starburst' },
      { id: 'tortillas', name: 'Tortillas' },
      { id: 'vegetable-soup', name: 'Vegetable soup', aliases: ['vegetable soups'] },
      { id: 'white-sugar', name: 'White sugar' },
      { id: 'wine-and-beer', name: 'Wine and beer', aliases: ['wine', 'beer'] },
      { id: 'worcestershire-sauce', name: 'Worcestershire sauce' },
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
