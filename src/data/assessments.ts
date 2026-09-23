import type { Assessment } from '../domain/schemas'
import { maintainerVegetarianAssessments } from './maintainerVegetarianAssessments'
import { teaAssessments } from './teaAssessments'

type Condition = {
  kind: 'preparation' | 'storage' | 'serving' | 'frequency' | 'composition' | 'other'
  instruction: string
}

type AssessmentSpec = {
  foodIds: string[]
  statusId: 'pregnancy-ok' | 'pregnancy-conditions' | 'pregnancy-avoid'
  summary: string
  locator: string
  instruction?: string
  conditions?: Condition[]
  relation?: 'replaces' | 'adds-to'
}

type CategorySubject = {
  categoryId: string
  scopeStatement: string
  /**
   * The preparation state this rule is about, where the guide gave a food group different advice
   * for different states. Set when a retired preparation-shaped category folded into its parent:
   * `Raw eggs` became `eggs` qualified by `raw`. The wording is the source's, unchanged.
   */
  preparationId?: string
}

type CategoryAssessmentSpec = {
  categories: CategorySubject[]
  statusId: 'pregnancy-ok' | 'pregnancy-conditions' | 'pregnancy-avoid'
  summary: string
  locator: string
  instruction?: string
  conditions?: Condition[]
}

const mpiCitation = {
  title: 'New Zealand Food Safety: Pullout guide to food safety in pregnancy',
  url: 'https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy',
}

const nswFoodAuthorityCitation = {
  title: 'NSW Food Authority: Foods to eat or avoid when pregnant',
  url: 'https://www.foodauthority.nsw.gov.au/consumer/life-events-and-food/pregnancy/foods-to-eat-or-avoid-when-pregnant',
}

const guidanceScenariosFor = (subjectId: string, spec: Pick<AssessmentSpec, 'instruction' | 'conditions'>) =>
  spec.instruction === undefined
    ? []
    : [{
        id: `${subjectId}-guidance`,
        applicability: 'When preparing or serving this food',
        instruction: spec.instruction,
        conditions: (spec.conditions ?? []).map((condition, index) => ({
          id: `${subjectId}-condition-${index + 1}`,
          ...condition,
        })),
      }]

const createAssessments = (spec: AssessmentSpec): Assessment[] =>
  spec.foodIds.map((foodId) => ({
    id: `${foodId}-pregnancy`,
    subject: { kind: 'food', foodId },
    guidanceListId: 'pregnancy-food-safety',
    // The pregnancy list now draws on more than one authority, so every assessment names the one
    // that stated it. These are all New Zealand Food Safety's.
    sourceId: 'new-zealand-food-safety',
    statusId: spec.statusId,
    summary: spec.summary,
    ...(spec.relation ? { relation: spec.relation } : {}),
    guidanceScenarios: guidanceScenariosFor(foodId, spec),
    reasonLinks: [],
    citations: [{ ...mpiCitation, locator: spec.locator }],
  }))

const createCategoryAssessments = (spec: CategoryAssessmentSpec): Assessment[] =>
  spec.categories.map(({ categoryId, scopeStatement, preparationId }) => {
    // A subject holds one assessment per preparation per source, so the record id carries the
    // preparation too. Without it, `eggs` raw and `eggs` cooked would collide.
    const subjectId = preparationId === undefined ? categoryId : `${categoryId}-${preparationId}`
    return {
      id: `${subjectId}-pregnancy`,
      subject: { kind: 'category', categoryId },
      ...(preparationId === undefined ? {} : { preparationId }),
      guidanceListId: 'pregnancy-food-safety',
      sourceId: 'new-zealand-food-safety',
      statusId: spec.statusId,
      summary: spec.summary,
      scopeStatement,
      guidanceScenarios: guidanceScenariosFor(subjectId, spec),
      reasonLinks: [],
      citations: [{ ...mpiCitation, locator: spec.locator }],
    }
  })

const categoryAssessmentSpecs: CategoryAssessmentSpec[] = [
  {
    categories: [{ categoryId: 'breads', scopeStatement: 'Applies to all breads.' }],
    statusId: 'pregnancy-ok',
    summary: 'The guide lists this food as okay to eat.',
    locator: 'Breads and cereals: Breads',
  },
  {
    categories: [{ categoryId: 'plain-cakes-slices-and-muffins', scopeStatement: 'Applies to all plain cakes, slices and muffins.' }],
    statusId: 'pregnancy-ok',
    summary: 'The guide lists this food as okay to eat.',
    locator: 'Breads and cereals: Cakes, slices, muffins etc — Plain',
  },
  {
    categories: [{ categoryId: 'cakes-slices-and-muffins-with-cream-or-custard', scopeStatement: 'Applies to all cakes, slices and muffins with added cream or custard.' }],
    statusId: 'pregnancy-conditions',
    summary: 'Avoid these unless the cream is newly opened and the custard is freshly made at home.',
    locator: 'Breads and cereals: Cakes, slices, muffins etc — With added cream or custard',
    instruction: 'Choose only when the cream is newly opened and the custard is freshly made at home.',
    conditions: [{ kind: 'composition', instruction: 'Do not eat if either condition is not met.' }],
  },
  {
    categories: [{ categoryId: 'cereals', scopeStatement: 'Applies to breakfast cereals, rice, pasta and similar cereal foods.' }],
    statusId: 'pregnancy-ok',
    summary: 'The guide lists this food as okay to eat.',
    locator: 'Breads and cereals: Cereals — Breakfast cereals, rice, pasta, and similar',
  },
  {
    categories: [{ categoryId: 'low-acid-soft-pasteurised-cheese', scopeStatement: 'Applies to all low-acid soft pasteurised cheese.' }],
    statusId: 'pregnancy-conditions',
    summary: 'Eat low-acid soft pasteurised cheese only when it is cooked.',
    locator: 'Dairy: Cheese — Low acid soft pasteurised cheese',
    instruction: 'Cook thoroughly before eating.',
    conditions: [{ kind: 'preparation', instruction: 'Do not eat it uncooked.' }],
  },
  {
    categories: [{ categoryId: 'hard-cheese', scopeStatement: 'Applies to all hard cheese.' }],
    statusId: 'pregnancy-ok',
    summary: 'The guide lists hard cheese as okay to eat when refrigerated.',
    locator: 'Dairy: Cheese — Hard cheese',
  },
  {
    categories: [{ categoryId: 'pasteurised-cottage-and-cream-cheese', scopeStatement: 'Applies to pasteurised cottage cheese, cream cheese and similar pasteurised cheese.' }],
    statusId: 'pregnancy-conditions',
    summary: 'Use pasteurised cheese from sealed packs within two days of opening, or cook it before its best-before date.',
    locator: 'Dairy: Cheese — Pasteurised cottage cheese, cream cheese, etc',
    instruction: 'Follow the sealed-pack, refrigeration, and use-by guidance.',
    conditions: [
      { kind: 'storage', instruction: 'Keep in its sealed pack and eat cold within two days of opening.' },
      { kind: 'preparation', instruction: 'Alternatively, cook it before the package best-before date.' },
    ],
  },
  {
    categories: [
      { categoryId: 'butter', scopeStatement: 'Applies to all butter.' },
      { categoryId: 'ice-cream', preparationId: 'store-bought', scopeStatement: 'Applies to all packaged ice cream.' },
    ],
    statusId: 'pregnancy-ok',
    summary: 'The guide lists this food as okay to eat.',
    locator: 'Dairy: Butter; Ice cream — Packaged',
  },
  {
    categories: [{ categoryId: 'cream', scopeStatement: 'Applies to all cream.' }],
    statusId: 'pregnancy-conditions',
    summary: 'Use cream from a sealed pack and eat it within two days of opening.',
    locator: 'Dairy: Cream',
    instruction: 'Keep refrigerated in its original packaging and prevent contamination.',
    conditions: [{ kind: 'storage', instruction: 'Eat within two days of opening the pack.' }],
  },
  {
    categories: [{ categoryId: 'custard', preparationId: 'store-bought', scopeStatement: 'Applies to all ready-made chilled custard.' }],
    statusId: 'pregnancy-conditions',
    summary: 'Keep packaged chilled custard refrigerated and eat it within two days of opening.',
    locator: 'Dairy: Custard — Ready-made chilled (packaged)',
    instruction: 'Keep refrigerated in its original packaging.',
    conditions: [{ kind: 'storage', instruction: 'Eat within two days of opening.' }],
  },
  {
    categories: [{ categoryId: 'custard', preparationId: 'home-made', scopeStatement: 'Applies to all home-made custard.' }],
    statusId: 'pregnancy-conditions',
    summary: 'Eat home-made custard hot after cooking; reheat leftovers until piping hot.',
    locator: 'Dairy: Custard — Home-made',
    instruction: 'Serve immediately after cooking or reheat leftovers before serving.',
    conditions: [{ kind: 'serving', instruction: 'Reheat leftovers above 75°C and eat immediately.' }],
  },
  {
    categories: [
      { categoryId: 'milk', preparationId: 'pasteurised', scopeStatement: 'Applies to all pasteurised milk.' },
      { categoryId: 'yoghurt', preparationId: 'pasteurised', scopeStatement: 'Applies to all pasteurised yoghurt.' },
    ],
    statusId: 'pregnancy-conditions',
    summary: 'Use pasteurised dairy under the manufacturer’s storage guidance.',
    locator: 'Dairy: Milk — Pasteurised; Yoghurt — Pasteurised',
    instruction: 'Keep refrigerated and avoid contaminating the packaging.',
    conditions: [{ kind: 'storage', instruction: 'Follow the package best-before and storage instructions.' }],
  },
  {
    categories: [
      { categoryId: 'dairy', preparationId: 'unpasteurised', scopeStatement: 'Applies to all unpasteurised milk and dairy products.' },
      { categoryId: 'ice-cream', preparationId: 'soft-serve', scopeStatement: 'Applies to all soft-serve ice cream.' },
    ],
    statusId: 'pregnancy-avoid',
    summary: 'The guide says not to eat this during pregnancy.',
    locator: 'Dairy: Unpasteurised milk and dairy products; Ice cream — Soft serve',
  },
  {
    categories: [{ categoryId: 'eggs', preparationId: 'raw', scopeStatement: 'Applies to raw eggs and to any food containing raw eggs.' }],
    statusId: 'pregnancy-avoid',
    summary: 'The guide says not to eat raw eggs or foods made with them.',
    locator: 'Eggs: Raw eggs',
  },
  {
    categories: [
      { categoryId: 'sauces-dressings-and-spreads', preparationId: 'home-made', scopeStatement: 'Applies to all home-made sauces and dressings, because only some of them contain raw egg.' },
      { categoryId: 'cold-desserts', scopeStatement: 'Applies to all cold desserts, because only some of them contain raw egg.' },
      { categoryId: 'ice-cream', preparationId: 'home-made', scopeStatement: 'Applies to all home-made ice cream, because only some of it contains raw egg.' },
      { categoryId: 'drinks', preparationId: 'home-made', scopeStatement: 'Applies to all home-made drinks, because only some of them contain raw egg.' },
    ],
    statusId: 'pregnancy-conditions',
    summary: 'The guide says not to eat foods containing raw eggs, so check whether this one contains raw egg.',
    locator: 'Eggs: Raw eggs',
    instruction: 'Check whether the food contains raw egg before eating it.',
    conditions: [
      { kind: 'composition', instruction: 'Do not eat it if it contains raw egg.' },
      { kind: 'preparation', instruction: 'If the egg in it is cooked, follow the guide’s cooked eggs advice instead.' },
    ],
  },
  {
    categories: [{ categoryId: 'eggs', preparationId: 'cooked', scopeStatement: 'Applies to all cooked eggs.' }],
    statusId: 'pregnancy-conditions',
    summary: 'Cook eggs until the yolk and scrambled egg are firm.',
    locator: 'Eggs: Cooked eggs',
    instruction: 'Cook eggs well before eating.',
    conditions: [{ kind: 'preparation', instruction: 'Ensure yolks and scrambled eggs are firm.' }],
  },
  {
    categories: [{ categoryId: 'meat-and-poultry', preparationId: 'cooked', scopeStatement: 'Applies to all cooked meat and poultry.' }],
    statusId: 'pregnancy-conditions',
    summary: 'Cook meat and poultry thoroughly, eat it hot, and reheat leftovers before serving.',
    locator: 'Meat and poultry: Cooked meats',
    instruction: 'Cook thoroughly and serve while hot.',
    conditions: [
      { kind: 'preparation', instruction: 'Cook until piping hot throughout and the juices run clear.' },
      { kind: 'storage', instruction: 'Store covered leftovers in the fridge for no more than two days.' },
      { kind: 'serving', instruction: 'Reheat leftovers and cold cooked meat above 75°C.' },
    ],
  },
  {
    categories: [
      { categoryId: 'meat-and-poultry', preparationId: 'processed', scopeStatement: 'Applies to all processed meats.' },
      { categoryId: 'meat-and-poultry', preparationId: 'cold-cooked', scopeStatement: 'Applies to all cold cooked poultry.' },
    ],
    statusId: 'pregnancy-conditions',
    summary: 'Eat only after heating until piping hot.',
    locator: 'Meat and poultry: Processed meats; Cold cooked poultry',
    instruction: 'Heat until piping hot before eating.',
    conditions: [{ kind: 'serving', instruction: 'Heat above 75°C.' }],
  },
  {
    categories: [{ categoryId: 'meat-and-poultry', preparationId: 'raw', scopeStatement: 'Applies to all raw meat and poultry.' }],
    statusId: 'pregnancy-avoid',
    summary: 'Do not eat or taste raw meat or poultry.',
    locator: 'Meat and poultry: Raw meat',
  },
  {
    categories: [
      { categoryId: 'fish', preparationId: 'raw', scopeStatement: 'Applies to all raw fish.' },
      { categoryId: 'shellfish', preparationId: 'raw', scopeStatement: 'Applies to all raw shellfish.' },
    ],
    statusId: 'pregnancy-avoid',
    summary: 'The guide says not to eat raw seafood.',
    locator: 'Seafood: Raw fish; Raw shellfish',
  },
  {
    categories: [{ categoryId: 'seafood', preparationId: 'cooked', scopeStatement: 'Applies to all freshly cooked fish, mussels, oysters, crayfish and scallops.' }],
    statusId: 'pregnancy-conditions',
    summary: 'Cook seafood thoroughly and eat it while hot.',
    locator: 'Seafood: Freshly cooked fish, mussels, oysters, crayfish, scallops, etc',
    instruction: 'Cook thoroughly and serve while hot.',
    conditions: [{ kind: 'preparation', instruction: 'Cook above 75°C throughout.' }],
  },
  {
    categories: [{ categoryId: 'seafood', preparationId: 'smoked', scopeStatement: 'Applies to all chilled smoked or pre-cooked fish, shellfish and crustacea.' }],
    statusId: 'pregnancy-conditions',
    summary: 'Eat chilled smoked or pre-cooked seafood only after heating until piping hot.',
    locator: 'Seafood: Smoked fish, shellfish and crustacea',
    instruction: 'Heat until piping hot before eating.',
    conditions: [{ kind: 'serving', instruction: 'Heat above 75°C.' }],
  },
  {
    categories: [
      { categoryId: 'fruit', preparationId: 'fresh', scopeStatement: 'Applies to all fresh fruit.' },
      { categoryId: 'vegetables', preparationId: 'fresh', scopeStatement: 'Applies to all fresh vegetables.' },
      { categoryId: 'salads', preparationId: 'home-made', scopeStatement: 'Applies to all home-made salads.' },
    ],
    statusId: 'pregnancy-conditions',
    summary: 'Wash this food carefully before use.',
    locator: 'Vegetables, salads and fruits: Fruit; Vegetables; Salads — Home-made',
    instruction: 'Wash well before eating raw or before cooking.',
  },
  {
    categories: [{ categoryId: 'herbs', preparationId: 'dried', scopeStatement: 'Applies to all dried herbs.' }],
    statusId: 'pregnancy-conditions',
    summary: 'Cook dried herbs thoroughly before eating.',
    locator: 'Vegetables, salads and fruits: Herbs — Dried herbs',
    instruction: 'Cook thoroughly before eating.',
    conditions: [{ kind: 'preparation', instruction: 'Do not use dried herbs uncooked.' }],
  },
  {
    categories: [{ categoryId: 'herbs', preparationId: 'fresh', scopeStatement: 'Applies to all fresh home-grown and store-bought herbs.' }],
    statusId: 'pregnancy-conditions',
    summary: 'Wash fresh herbs well before using.',
    locator: 'Vegetables, salads and fruits: Herbs — Fresh home-grown and store-bought',
    instruction: 'Wash well before using.',
  },
  {
    categories: [
      { categoryId: 'fruit', preparationId: 'frozen', scopeStatement: 'Applies to all imported frozen berries.' },
      { categoryId: 'vegetables', preparationId: 'frozen', scopeStatement: 'Applies to all frozen vegetables.' },
    ],
    statusId: 'pregnancy-conditions',
    summary: 'Cook before eating.',
    locator: 'Vegetables, salads and fruits: Fruit — Imported frozen berries; Vegetables — Frozen vegetables',
    instruction: 'Cook before eating.',
    conditions: [{ kind: 'preparation', instruction: 'Do not eat uncooked frozen produce.' }],
  },
  {
    categories: [{ categoryId: 'salads', preparationId: 'store-bought', scopeStatement: 'Applies to all pre-packaged and ready-made salads.' }],
    statusId: 'pregnancy-avoid',
    summary: 'The guide says not to eat pre-packaged or ready-made salads.',
    locator: 'Vegetables, salads and fruits: Salads — Pre-packaged and ready-made',
  },
  {
    categories: [{ categoryId: 'leftover-cooked-foods', scopeStatement: 'Applies to all leftover cooked foods.' }],
    statusId: 'pregnancy-conditions',
    summary: 'Keep refrigerated leftovers for no more than two days and reheat them before eating.',
    locator: 'Miscellaneous: Leftovers — Cooked foods',
    instruction: 'Store covered in the fridge and reheat before serving.',
    conditions: [
      { kind: 'storage', instruction: 'Eat refrigerated leftovers within two days.' },
      { kind: 'serving', instruction: 'Reheat above 75°C; do not eat cold leftovers.' },
    ],
  },
  {
    categories: [{ categoryId: 'stuffing', scopeStatement: 'Applies to chicken and turkey stuffing.' }],
    statusId: 'pregnancy-conditions',
    summary: 'Eat chicken or turkey stuffing only when it is cooked separately and served hot.',
    locator: 'Miscellaneous: Stuffing',
    instruction: 'Cook stuffing in a separate dish and serve hot.',
    conditions: [
      { kind: 'storage', instruction: 'Keep leftovers in the fridge for no more than two days.' },
      { kind: 'serving', instruction: 'Reheat leftovers above 75°C.' },
    ],
  },
  {
    categories: [{ categoryId: 'canned-foods', scopeStatement: 'Applies to all canned foods.' }],
    statusId: 'pregnancy-conditions',
    summary: 'Remove leftovers from the can, refrigerate them covered, and eat them within two days.',
    locator: 'Miscellaneous: Canned foods',
    instruction: 'Store uneaten leftovers covered in the fridge.',
    conditions: [{ kind: 'storage', instruction: 'Store covered leftovers in the fridge and eat them within two days.' }],
  },
  {
    categories: [{ categoryId: 'sauces-dressings-and-spreads', preparationId: 'store-bought', scopeStatement: 'Applies to commercially manufactured sauces, dressings and spreads.' }],
    statusId: 'pregnancy-conditions',
    summary: 'Refrigerate opened products and follow their manufacturer storage and heating instructions.',
    locator: 'Miscellaneous: Sauces, dressings and spreads',
    instruction: 'Follow the manufacturer’s instructions after opening.',
    conditions: [{ kind: 'storage', instruction: 'Refrigerate opened products and observe the stated storage limit.' }],
  },
  {
    categories: [
      { categoryId: 'sushi', preparationId: 'store-bought', scopeStatement: 'Applies to all store-bought sushi.' },
      { categoryId: 'hummus-and-tahini-dips', scopeStatement: 'Applies to hummus and other dips containing tahini.' },
    ],
    statusId: 'pregnancy-avoid',
    summary: 'The guide says not to eat this during pregnancy.',
    locator: 'Miscellaneous: Sushi — Store-bought; Hummus and other dips containing tahini',
  },
  {
    categories: [{ categoryId: 'sushi', preparationId: 'home-made', scopeStatement: 'Applies to all home-made sushi.' }],
    statusId: 'pregnancy-conditions',
    summary: 'Use freshly cooked rice, avoid raw or cold cooked meat or seafood, and eat immediately.',
    locator: 'Miscellaneous: Sushi — Home-made',
    instruction: 'Prepare with freshly cooked rice and eat immediately.',
    conditions: [
      { kind: 'composition', instruction: 'Do not use raw or cold cooked meat or seafood.' },
      { kind: 'serving', instruction: 'Do not keep leftovers.' },
    ],
  },
  {
    categories: [{ categoryId: 'brown-seaweed', scopeStatement: 'Applies to all brown seaweed.' }],
    statusId: 'pregnancy-conditions',
    summary: 'Limit brown seaweed to one serve each week.',
    locator: 'Miscellaneous: Seaweed — Brown seaweed',
    instruction: 'Limit intake during pregnancy.',
    conditions: [{ kind: 'frequency', instruction: 'Have no more than one serving per week.' }],
  },
  {
    categories: [{ categoryId: 'red-and-green-seaweed', scopeStatement: 'Applies to all red or green seaweed.' }],
    statusId: 'pregnancy-ok',
    summary: 'The guide lists red and green seaweed as okay to eat; sushi advice still applies when relevant.',
    locator: 'Miscellaneous: Seaweed — Red or green seaweed',
  },
  {
    categories: [{ categoryId: 'sprouts-and-enoki-mushrooms', scopeStatement: 'Applies to all seed sprouts and enoki mushrooms.' }],
    statusId: 'pregnancy-conditions',
    summary: 'Do not eat these raw; cook them first.',
    locator: 'Miscellaneous: Sprouts and enoki mushrooms',
    instruction: 'Cook before eating.',
    conditions: [{ kind: 'preparation', instruction: 'Do not eat raw.' }],
  },
  {
    categories: [{ categoryId: 'fruit-juice-kombucha-and-cider', preparationId: 'pasteurised', scopeStatement: 'Applies to all pasteurised fruit juice, kombucha and cider.' }],
    statusId: 'pregnancy-ok',
    summary: 'The guide lists pasteurised drinks in this group as okay to drink.',
    locator: 'Miscellaneous: Fruit juice, kombucha and cider (non-alcoholic) — Pasteurised',
  },
  {
    categories: [{ categoryId: 'fruit-juice-kombucha-and-cider', preparationId: 'unpasteurised', scopeStatement: 'Applies to all unpasteurised (raw) fruit juice, kombucha and cider.' }],
    statusId: 'pregnancy-avoid',
    summary: 'The guide says not to drink unpasteurised drinks in this group.',
    locator: 'Miscellaneous: Fruit juice, kombucha and cider (non-alcoholic) — Unpasteurised (raw)',
  },
]

const assessmentSpecs: AssessmentSpec[] = [
  {
    foodIds: ['mayonnaise', 'hollandaise-sauce', 'caesar-dressing', 'mousse', 'tiramisu', 'eggnog', 'egg-flips'],
    statusId: 'pregnancy-avoid',
    summary: 'The guide names this among the foods containing raw eggs that it says not to eat.',
    locator: 'Eggs: Raw eggs',
  },
  {
    foodIds: ['fresh-filled-pasta'],
    statusId: 'pregnancy-conditions',
    summary: 'Check the guidance for the filling before eating fresh filled pasta.',
    locator: 'Breads and cereals: Cereals',
    instruction: 'Follow the advice specific to the filling.',
    conditions: [{ kind: 'composition', instruction: 'Do not treat the general pasta advice as applying to fresh filled pasta.' }],
  },
  {
    foodIds: [
      'anchovy', 'arrow-squid', 'barracouta', 'blue-cod', 'brill-and-turbot', 'cockles', 'eel',
      'elephant-fish', 'flounders', 'gurnard', 'hoki', 'john-dory', 'ling', 'monkfish-or-stargazer',
      'orange-perch', 'orange-roughy', 'oreo-dories', 'parore', 'smooth-oreo', 'sole',
      'southern-blue-whiting', 'surf-clams', 'tarakihi', 'toothfish', 'warehou', 'whitebait',
    ],
    statusId: 'pregnancy-ok',
    summary: 'The guide lists this species as requiring no mercury-serving restriction.',
    locator: 'Recommended servings for fish species to minimise mercury intakes: No restriction necessary',
  },
  {
    foodIds: ['brown-trout', 'rainbow-trout'],
    statusId: 'pregnancy-conditions',
    summary: 'The guide lists this trout as unrestricted only outside its stated excluded location.',
    locator: 'Recommended servings for fish species to minimise mercury intakes: No restriction necessary',
    instruction: 'Follow the source’s location exception.',
    conditions: [{ kind: 'other', instruction: 'Do not treat the listed excluded lake or geothermal source as unrestricted.' }],
  },
  {
    foodIds: ['mussels', 'oysters', 'scallops'],
    statusId: 'pregnancy-conditions',
    summary: 'Cook thoroughly, eat while hot, and follow the source’s species-specific mercury notes.',
    locator: 'Seafood: Freshly cooked fish, mussels, oysters, crayfish, scallops, etc; Recommended fish servings',
    instruction: 'Cook thoroughly and serve while hot.',
    conditions: [{ kind: 'preparation', instruction: 'Cook above 75°C throughout.' }],
  },
  {
    foodIds: ['skipjack-tuna'],
    statusId: 'pregnancy-ok',
    summary: 'The guide lists skipjack tuna as requiring no mercury-serving restriction.',
    locator: 'Recommended servings for fish species to minimise mercury intakes: No restriction necessary',
  },
  {
    foodIds: [
      'albacore-tuna', 'alfonsino', 'bass', 'bluenose', 'ghost-sharks', 'hake', 'hapuka-or-groper',
      'javelin-fish', 'kahawai', 'kingfish', 'lake-taupo-trout', 'leatherjacket', 'lemon-sole',
      'mackerel', 'red-cod', 'ribaldo', 'rig', 'rock-lobster', 'farmed-salmon', 'sea-perch',
      'silverside', 'skate', 'snapper', 'sprats', 'trevally',
    ],
    statusId: 'pregnancy-conditions',
    summary: 'Limit this species to three or four servings each week.',
    locator: 'Recommended servings for fish species to minimise mercury intakes: 3–4 servings per week acceptable',
    instruction: 'Limit weekly intake.',
    conditions: [{ kind: 'frequency', instruction: 'Have no more than three or four servings per week.' }],
  },
  {
    foodIds: [
      'cardinal-fish', 'dogfish', 'lake-rotomahana-trout', 'geothermal-lake-trout', 'school-shark',
      'striped-marlin', 'southern-bluefin-tuna', 'swordfish',
    ],
    statusId: 'pregnancy-conditions',
    summary: 'Limit this species to one serving every one or two weeks.',
    locator: 'Recommended servings for fish species to minimise mercury intakes: 1 serving per 1–2 weeks acceptable',
    instruction: 'Limit intake during pregnancy.',
    conditions: [{ kind: 'frequency', instruction: 'Have no more than one serving every one or two weeks.' }],
  },
  {
    foodIds: ['bluff-and-pacific-oysters', 'queen-scallops'],
    statusId: 'pregnancy-conditions',
    summary: 'Limit these shellfish to one serving each month.',
    locator: 'Seafood footnote: Bluff and Pacific oysters and queen scallops',
    instruction: 'Limit intake during pregnancy.',
    conditions: [{ kind: 'frequency', instruction: 'Have no more than one serving per month.' }],
    // The source presents this footnote as an addition to the group's cooking rule, not as a
    // carve-out from it: a serving limit does not exempt an oyster from being cooked through.
    relation: 'adds-to',
  },
]

const vegetarianAssessments: Assessment[] = [
  {
    id: 'pies-and-other-pastries-vegetarian',
    subject: { kind: 'food', foodId: 'pies-and-other-pastries' },
    guidanceListId: 'vegetarian-suitability',
    statusId: 'vegetarian-check-ingredients',
    summary: 'Some pies and other pastries use lard, so check the ingredients.',
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [],
  },
  {
    id: 'french-fries-vegetarian',
    subject: { kind: 'food', foodId: 'french-fries' },
    guidanceListId: 'vegetarian-suitability',
    statusId: 'vegetarian-check-ingredients',
    summary: 'Restaurant fries can be cooked in animal fats, so ask how they are prepared.',
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [],
  },
  {
    id: 'gelatin-vegetarian',
    subject: { kind: 'food', foodId: 'gelatin' },
    guidanceListId: 'vegetarian-suitability',
    statusId: 'vegetarian-animal-derived',
    summary: 'Gelatin is an animal-derived gelling ingredient.',
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [],
  },
  {
    id: 'gummy-bears-vegetarian',
    subject: { kind: 'food', foodId: 'gummy-bears' },
    guidanceListId: 'vegetarian-suitability',
    statusId: 'vegetarian-check-ingredients',
    summary: 'Gummy bears can contain gelatin; gelatin-free alternatives exist.',
    guidanceScenarios: [],
    reasonLinks: [{ kind: 'contains', targetFoodId: 'gelatin', statement: 'Can contain gelatin.' }],
    citations: [],
  },
  {
    id: 'jelly-vegetarian',
    subject: { kind: 'food', foodId: 'jelly' },
    guidanceListId: 'vegetarian-suitability',
    statusId: 'vegetarian-check-ingredients',
    summary: 'Check whether jelly contains animal-derived ingredients; vegan alternatives exist.',
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [],
  },
  {
    id: 'marshmallows-vegetarian',
    subject: { kind: 'food', foodId: 'marshmallows' },
    guidanceListId: 'vegetarian-suitability',
    statusId: 'vegetarian-animal-derived',
    summary: 'Marshmallows traditionally contain animal-derived gelatin.',
    guidanceScenarios: [],
    reasonLinks: [{ kind: 'contains', targetFoodId: 'gelatin', statement: 'Contains gelatin.' }],
    citations: [],
  },
  {
    id: 'orange-juice-vegetarian',
    subject: { kind: 'food', foodId: 'orange-juice' },
    guidanceListId: 'vegetarian-suitability',
    statusId: 'vegetarian-check-ingredients',
    summary: 'Some orange juice brands add omega-3 derived from fish.',
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [],
  },
  {
    id: 'panna-cotta-vegetarian',
    subject: { kind: 'food', foodId: 'panna-cotta' },
    guidanceListId: 'vegetarian-suitability',
    statusId: 'vegetarian-animal-derived',
    summary: 'Panna cotta traditionally uses gelatin to set.',
    guidanceScenarios: [],
    reasonLinks: [{ kind: 'contains', targetFoodId: 'gelatin', statement: 'Contains gelatin.' }],
    citations: [],
  },
  {
    id: 'parmesan-vegetarian',
    subject: { kind: 'food', foodId: 'parmesan' },
    guidanceListId: 'vegetarian-suitability',
    statusId: 'vegetarian-animal-derived',
    summary: 'Traditional Parmesan uses animal-derived rennet.',
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [],
  },
  {
    id: 'starburst-vegetarian',
    subject: { kind: 'food', foodId: 'starburst' },
    guidanceListId: 'vegetarian-suitability',
    statusId: 'vegetarian-animal-derived',
    summary: 'The article identifies Starburst as containing gelatin.',
    guidanceScenarios: [],
    reasonLinks: [{ kind: 'contains', targetFoodId: 'gelatin', statement: 'Contains gelatin.' }],
    citations: [],
  },
  {
    id: 'tortillas-vegetarian',
    subject: { kind: 'food', foodId: 'tortillas' },
    guidanceListId: 'vegetarian-suitability',
    statusId: 'vegetarian-check-ingredients',
    summary: 'Some tortillas use lard, so check the ingredients or ask the cook.',
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [],
  },
  {
    id: 'white-sugar-vegetarian',
    subject: { kind: 'food', foodId: 'white-sugar' },
    guidanceListId: 'vegetarian-suitability',
    statusId: 'vegetarian-check-ingredients',
    summary: 'White sugar can be refined using bone char, so check how it is processed.',
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [],
  },
  {
    id: 'wine-and-beer-vegetarian',
    subject: { kind: 'food', foodId: 'wine-and-beer' },
    guidanceListId: 'vegetarian-suitability',
    statusId: 'vegetarian-check-ingredients',
    summary: 'Some wines and beers use fish-derived isinglass; vegetarian alternatives exist.',
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [],
  },
  {
    id: 'worcestershire-sauce-vegetarian',
    subject: { kind: 'food', foodId: 'worcestershire-sauce' },
    guidanceListId: 'vegetarian-suitability',
    statusId: 'vegetarian-check-ingredients',
    summary: 'Worcestershire sauce can contain anchovies; vegan alternatives exist.',
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [],
  },
]

const vegetarianCategoryAssessments: Assessment[] = [
  {
    id: 'hard-cheese-vegetarian',
    subject: { kind: 'category', categoryId: 'hard-cheese' },
    guidanceListId: 'vegetarian-suitability',
    statusId: 'vegetarian-check-ingredients',
    summary: 'Traditional hard cheese can be set using animal-derived rennet, so check the label.',
    scopeStatement: 'Applies to all hard cheese.',
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [],
  },
  {
    id: 'yoghurt-pasteurised-vegetarian',
    subject: { kind: 'category', categoryId: 'yoghurt' },
    preparationId: 'pasteurised',
    guidanceListId: 'vegetarian-suitability',
    statusId: 'vegetarian-check-ingredients',
    summary: 'Some yoghurts use gelatin as a gelling agent, so check the label.',
    scopeStatement: 'Applies to all pasteurised yoghurt.',
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [],
  },
  {
    id: 'soups-vegetarian',
    subject: { kind: 'category', categoryId: 'soups' },
    guidanceListId: 'vegetarian-suitability',
    statusId: 'vegetarian-check-ingredients',
    summary: 'Soups can be made with meat or fish stock, so check the stock used.',
    scopeStatement: 'Applies to all soups.',
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [],
  },
]

// NSW Food Authority additions, drawn from the "Foods to eat or avoid when pregnant" table. These
// are foods and categories the New Zealand Food Safety-based content above does not yet cover, so
// each is a first assessment for its subject rather than a second opinion alongside an existing one.
const nswFoodAuthorityAssessments: Assessment[] = [
  {
    id: 'soy-products-pregnancy',
    subject: { kind: 'category', categoryId: 'soy-products' },
    guidanceListId: 'pregnancy-food-safety',
    sourceId: 'nsw-food-authority',
    statusId: 'pregnancy-ok',
    summary: 'The source lists soy products such as tofu, soy milk and soy yoghurt as okay to eat, provided you check the best-before or use-by date and follow the storage instructions.',
    scopeStatement: 'Applies to all soy products, including tofu, soy milk and soy yoghurt.',
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [{ ...nswFoodAuthorityCitation, locator: 'Other foods: Soy' }],
  },
  {
    id: 'fermented-drinks-pregnancy',
    subject: { kind: 'category', categoryId: 'fermented-drinks' },
    guidanceListId: 'pregnancy-food-safety',
    sourceId: 'nsw-food-authority',
    statusId: 'pregnancy-avoid',
    summary: 'The source says not to drink kvass, kefir or ginger beer during pregnancy, because of an increased contamination risk and the possibility of residual alcohol from fermentation.',
    scopeStatement: 'Applies to kvass, kefir and ginger beer.',
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [{ ...nswFoodAuthorityCitation, locator: 'Other foods: Fermented drinks' }],
  },
  {
    id: 'rockmelon-pregnancy',
    subject: { kind: 'food', foodId: 'rockmelon' },
    guidanceListId: 'pregnancy-food-safety',
    sourceId: 'nsw-food-authority',
    statusId: 'pregnancy-avoid',
    summary: 'The source says not to eat rockmelon during pregnancy, because its rough rind can trap bacteria that cutting can transfer into the flesh.',
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [{ ...nswFoodAuthorityCitation, locator: 'Vegetables & fruit: Fruit — Rockmelon' }],
  },
]

export const assessments = [
  ...assessmentSpecs.flatMap(createAssessments),
  ...categoryAssessmentSpecs.flatMap(createCategoryAssessments),
  ...teaAssessments,
  ...vegetarianAssessments,
  ...vegetarianCategoryAssessments,
  ...maintainerVegetarianAssessments,
  ...nswFoodAuthorityAssessments,
]
