import type { Assessment } from '../domain/schemas'

// ADR: Model guidance sources as attributed peers within a guidance list.
// See: docs/decisions/2026-08-08 ADR - model guidance sources as attributed peers within a guidance list.md
//
// Three reviewed tea sources join New Zealand Food Safety inside the pregnancy list. They frequently
// disagree, and that disagreement is authored rather than resolved here: each source's own advice is
// one record naming that source, the most cautious authored status governs the entry, and the
// dissenting positions are stated in words and linked. Nothing is merged, averaged, or reworded into
// a combined position no authority stated.
//
// Where a source declines to judge — the American Pregnancy Association's "insufficient reliable
// information available" — it is authored as `pregnancy-insufficient-evidence` rather than as a
// conditional verdict, because a source that does not know has not decided that conditions apply.

type TeaSourceId =
  | 'medeniyet-medical-journal'
  | 'american-pregnancy-association'
  | 'babycenter'

type TeaStatusId =
  | 'pregnancy-ok'
  | 'pregnancy-conditions'
  | 'pregnancy-insufficient-evidence'
  | 'pregnancy-avoid'

type Condition = {
  kind: 'preparation' | 'storage' | 'serving' | 'frequency' | 'composition' | 'other'
  instruction: string
  facts?: { label: string, valueText: string }[]
}

type TeaSpecBase = {
  /** The food or category this source spoke about. */
  subjectId: string
  subjectKind: 'food' | 'category'
  sourceId: TeaSourceId
  statusId: TeaStatusId
  summary: string
  locator: string
  scopeStatement?: string
  relation?: 'replaces' | 'adds-to'
  reasonLinks?: { kind: 'contains' | 'derived-from' | 'made-with' | 'other', targetFoodId: string, statement: string }[]
}

/**
 * How to follow the advice, where the source gave steps as well as a verdict. The instruction and its
 * conditions travel together because a step with nothing qualifying it is only the summary restated,
 * so a source either authored both or neither.
 */
type TeaSpec = TeaSpecBase & (
  | { instruction: string, conditions: Condition[] }
  | { instruction?: never, conditions?: never }
)

const citations: Record<TeaSourceId, { title: string, url: string }> = {
  'medeniyet-medical-journal': {
    title: 'Medeniyet Medical Journal: Frequently used herbal teas during pregnancy - Short update',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7384490/',
  },
  'american-pregnancy-association': {
    title: 'American Pregnancy Association: Herbal Tea and Pregnancy',
    url: 'https://americanpregnancy.org/pregnancy/herbal-tea/',
  },
  babycenter: {
    title: 'BabyCenter: Herbal teas during pregnancy',
    url: 'https://www.babycenter.com/pregnancy/diet-and-fitness/herbal-teas-during-pregnancy_3537',
  },
}

const createTeaAssessment = (spec: TeaSpec): Assessment => {
  const id = `${spec.subjectId}-pregnancy-${spec.sourceId}`
  return {
    id,
    subject: spec.subjectKind === 'food'
      ? { kind: 'food', foodId: spec.subjectId }
      : { kind: 'category', categoryId: spec.subjectId },
    guidanceListId: 'pregnancy-food-safety',
    sourceId: spec.sourceId,
    statusId: spec.statusId,
    summary: spec.summary,
    ...(spec.scopeStatement ? { scopeStatement: spec.scopeStatement } : {}),
    ...(spec.relation ? { relation: spec.relation } : {}),
    guidanceScenarios: spec.instruction === undefined ? [] : [{
      id: `${id}-guidance`,
      applicability: 'When choosing or drinking this tea',
      instruction: spec.instruction,
      conditions: spec.conditions.map((condition, index) => ({
        id: `${id}-condition-${index + 1}`,
        ...condition,
      })),
    }],
    reasonLinks: spec.reasonLinks ?? [],
    citations: [{ ...citations[spec.sourceId], locator: spec.locator }],
  }
}

/**
 * A tea that only one source named, where that source said to avoid it. Each entry keeps its own
 * authored sentence; the shared shape is the record structure, never the wording.
 */
type AvoidListEntry = { subjectId: string, sourceId: TeaSourceId, summary: string, locator: string }

const avoidListSpecs: AvoidListEntry[] = [
  {
    subjectId: 'licorice-root-tea',
    sourceId: 'babycenter',
    summary: 'Licorice root is on BabyCenter’s list of herbal teas to avoid while pregnant or nursing.',
    locator: 'Teas to avoid during pregnancy - Other herbal teas to avoid',
  },
  {
    subjectId: 'sage-tea',
    sourceId: 'babycenter',
    summary: 'Sage is on BabyCenter’s list of herbal teas to avoid while pregnant or nursing, though it says food-sized amounts of the herb are a different matter.',
    locator: 'Teas to avoid during pregnancy - Other herbal teas to avoid',
  },
  {
    subjectId: 'pennyroyal-tea',
    sourceId: 'babycenter',
    summary: 'Pennyroyal is on BabyCenter’s list of herbal teas to avoid while pregnant or nursing.',
    locator: 'Teas to avoid during pregnancy - Other herbal teas to avoid',
  },
  {
    subjectId: 'black-cohosh-tea',
    sourceId: 'babycenter',
    summary: 'Black cohosh is on BabyCenter’s list of herbal teas to avoid while pregnant or nursing.',
    locator: 'Teas to avoid during pregnancy - Other herbal teas to avoid',
  },
  {
    subjectId: 'blue-cohosh-tea',
    sourceId: 'babycenter',
    summary: 'Blue cohosh is on BabyCenter’s list of herbal teas to avoid while pregnant or nursing.',
    locator: 'Teas to avoid during pregnancy - Other herbal teas to avoid',
  },
  {
    subjectId: 'motherwort-tea',
    sourceId: 'babycenter',
    summary: 'Motherwort is on BabyCenter’s list of herbal teas to avoid while pregnant or nursing.',
    locator: 'Teas to avoid during pregnancy - Other herbal teas to avoid',
  },
  {
    subjectId: 'borage-tea',
    sourceId: 'babycenter',
    summary: 'Borage is on BabyCenter’s list of herbal teas to avoid while pregnant or nursing.',
    locator: 'Teas to avoid during pregnancy - Other herbal teas to avoid',
  },
  {
    subjectId: 'hibiscus-tea',
    sourceId: 'babycenter',
    summary: 'Hibiscus is on BabyCenter’s list of herbal teas to avoid while pregnant or nursing.',
    locator: 'Teas to avoid during pregnancy - Other herbal teas to avoid',
  },
  {
    subjectId: 'lemongrass-tea',
    sourceId: 'babycenter',
    summary: 'Lemongrass is on BabyCenter’s list of herbal teas to avoid while pregnant or nursing, and it also turns up in blends sold as pregnancy teas.',
    locator: 'Teas to avoid during pregnancy - Other herbal teas to avoid; What about herbal teas made for pregnancy?',
  },
  {
    subjectId: 'rosemary-tea',
    sourceId: 'babycenter',
    summary: 'Rosemary is on BabyCenter’s list of herbal teas to avoid while pregnant or nursing, though it says food-sized amounts of the herb are a different matter.',
    locator: 'Teas to avoid during pregnancy - Other herbal teas to avoid',
  },
  {
    subjectId: 'st-johns-wort-tea',
    sourceId: 'babycenter',
    summary: 'St John’s wort is on BabyCenter’s list of herbal teas that are not safe during pregnancy or while nursing.',
    locator: 'Is it safe to drink herbal tea during pregnancy?; Teas to avoid during pregnancy - Other herbal teas to avoid',
  },
  {
    subjectId: 'alfalfa-tea',
    sourceId: 'babycenter',
    summary: 'Alfalfa is on BabyCenter’s list of herbal teas to avoid while pregnant or nursing, and it also turns up in blends sold as pregnancy teas.',
    locator: 'Teas to avoid during pregnancy - Other herbal teas to avoid; What about herbal teas made for pregnancy?',
  },
  {
    subjectId: 'alfalfa-tea',
    sourceId: 'american-pregnancy-association',
    summary: 'Alfalfa is rated possibly unsafe, though the article notes it is a source of vitamin K that some use late in pregnancy.',
    locator: 'The Herbs Used - Alfalfa',
  },
  {
    subjectId: 'yellow-dock-tea',
    sourceId: 'american-pregnancy-association',
    summary: 'Yellow dock is rated possibly unsafe; it is used for its iron content but also acts as a laxative, so talk to your midwife or doctor first.',
    locator: 'The Herbs Used - Yellow Dock',
  },
]

const teaSpecs: TeaSpec[] = [
  // Caffeinated tea. Both sources agree the answer is a caffeine budget and reach the same status,
  // so their rules stack as layers. They differ on the number, which the reader sees because each
  // source's own limit stays inside that source's own sentence.
  {
    subjectId: 'caffeinated-tea',
    subjectKind: 'category',
    sourceId: 'babycenter',
    statusId: 'pregnancy-conditions',
    summary: 'Black, green and white teas are fine in reasonable amounts, but keep your total caffeine under 200 mg a day.',
    scopeStatement: 'Applies to all caffeinated tea.',
    locator: 'Considerations for pregnant women who drink tea - Be aware of caffeine; Which teas are safe to drink while pregnant?',
    instruction: 'Count the caffeine across everything you drink in a day, and watch the sugar in bought tea drinks.',
    conditions: [
      {
        kind: 'frequency',
        instruction: 'Keep caffeine under 200 mg a day, the limit the American College of Obstetricians and Gynecologists recommends.',
        facts: [
          { label: 'Black tea', valueText: 'almost 50 mg per cup' },
          { label: 'Green tea', valueText: 'about 25 mg per cup' },
        ],
      },
      { kind: 'preparation', instruction: 'The longer a tea is steeped, the more caffeine it has.' },
      { kind: 'composition', instruction: 'Bottled iced teas and coffee-shop tea drinks are often very high in sugar, which matters more if you have gestational diabetes.' },
    ],
  },
  {
    subjectId: 'caffeinated-tea',
    subjectKind: 'category',
    sourceId: 'american-pregnancy-association',
    statusId: 'pregnancy-conditions',
    summary: 'There is no agreed safe amount of caffeine, so the less you have the better; talk to your midwife or doctor about what is right for you.',
    scopeStatement: 'Applies to all caffeinated tea.',
    locator: 'Which teas are safe during pregnancy? - Non-Herbal Teas',
    instruction: 'Decide your own limit with your midwife or doctor rather than assuming a number.',
    conditions: [
      {
        kind: 'other',
        instruction: 'Decaffeinated tea still contains a small amount of caffeine.',
        facts: [
          { label: 'Average cup', valueText: 'about 40-50 mg of caffeine' },
          { label: 'Decaffeinated cup', valueText: 'about 0.4 mg of caffeine' },
        ],
      },
    ],
  },
  {
    // Adds to BabyCenter's own caffeine rule rather than replacing it: the folate point is an extra
    // reason to hold back, not an exemption from counting caffeine.
    subjectId: 'green-tea',
    subjectKind: 'food',
    sourceId: 'babycenter',
    statusId: 'pregnancy-conditions',
    summary: 'Limit green tea to fewer than three cups a day: it is high in catechins, which can stop your cells fully absorbing folic acid.',
    locator: 'Which teas are safe to drink while pregnant? - Green tea',
    instruction: 'Keep green tea and matcha to fewer than three cups a day.',
    conditions: [{ kind: 'frequency', instruction: 'Have fewer than three cups a day, on top of the daily caffeine limit.' }],
    relation: 'adds-to',
  },

  // Herbal tea. All three remaining sources reach the same status: some are fine, some are not, ask
  // a clinician. Each states it in its own terms, and each names different teas below.
  {
    subjectId: 'herbal-tea',
    subjectKind: 'category',
    sourceId: 'babycenter',
    statusId: 'pregnancy-conditions',
    summary: 'Some herbal teas are safe in pregnancy and some are not, so check with your doctor or midwife before drinking any of them.',
    scopeStatement: 'Applies to all herbal tea.',
    locator: 'Is it safe to drink herbal tea during pregnancy?',
    instruction: 'Take the packet, or a photo of it, to your midwife or doctor before you start drinking a new blend.',
    conditions: [
      { kind: 'composition', instruction: 'Herbs are far more concentrated in tea than in food, so a tea can be harmful even where eating the herb is not.' },
      { kind: 'other', instruction: 'Herbal teas are not regulated, so there is no check on the quality, quantity or contamination of the ingredients, and they can interact with your medications.' },
    ],
  },
  {
    subjectId: 'herbal-tea',
    subjectKind: 'category',
    sourceId: 'american-pregnancy-association',
    statusId: 'pregnancy-conditions',
    summary: 'Commercial herbal teas in reasonable amounts are thought to be safe; the ones considered unsafe are those not made commercially, those using excessive amounts of herbs, and those using herbs known to be toxic.',
    scopeStatement: 'Applies to all herbal tea.',
    locator: 'Which teas are safe during pregnancy? - Herbal teas',
    instruction: 'Stick to commercially made teas in reasonable amounts, and talk to your midwife or doctor about any you are interested in.',
    conditions: [
      { kind: 'preparation', instruction: 'Do not brew a home-made tea from a plant growing in the garden unless you know exactly what it is and that it is safe in pregnancy.' },
    ],
  },
  {
    subjectId: 'herbal-tea',
    subjectKind: 'category',
    sourceId: 'medeniyet-medical-journal',
    statusId: 'pregnancy-conditions',
    summary: 'There are no clinical trials and no evidence-based proof that herbal teas are safe in pregnancy, so the review limits them to two cups a day.',
    scopeStatement: 'Applies to all herbal tea.',
    locator: 'Frequently used herbal teas during pregnancy',
    instruction: 'Keep herbal tea to two cups a day, and take extra care in the first trimester.',
    conditions: [
      { kind: 'frequency', instruction: 'Have no more than two cups a day.' },
      { kind: 'preparation', instruction: 'Avoid tinctures, which are far more concentrated than an infusion and carry alcohol.' },
    ],
  },

  // Chamomile: two sources say avoid, one says it does not know.
  {
    subjectId: 'chamomile-tea',
    subjectKind: 'food',
    sourceId: 'babycenter',
    statusId: 'pregnancy-avoid',
    summary: 'An observational study of more than 600 pregnant women linked regular chamomile to preterm delivery and lower birth weight, so it is best skipped in pregnancy.',
    locator: 'Teas to avoid during pregnancy - Chamomile tea',
  },
  {
    subjectId: 'chamomile-tea',
    subjectKind: 'food',
    sourceId: 'medeniyet-medical-journal',
    statusId: 'pregnancy-avoid',
    summary: 'Regular use has been linked to preterm labour, miscarriage and constricted ductus arteriosus in two reported cases, so the review considered chamomile unsafe in pregnancy.',
    locator: 'Frequently used herbal teas during pregnancy - German chamomile (Matricaria recutita)',
  },
  {
    subjectId: 'chamomile-tea',
    subjectKind: 'food',
    sourceId: 'american-pregnancy-association',
    statusId: 'pregnancy-insufficient-evidence',
    summary: 'German chamomile is rated as having insufficient reliable information available, so talk to your midwife or doctor before drinking it.',
    locator: 'The Herbs Used - Chamomile (German)',
  },

  // Peppermint: the review attaches an early-pregnancy caution, the other two call it safe outright.
  {
    subjectId: 'peppermint-tea',
    subjectKind: 'food',
    sourceId: 'medeniyet-medical-journal',
    statusId: 'pregnancy-conditions',
    summary: 'No harmful effect of peppermint tea on mother or baby has been shown, but excessive use is contraindicated in early pregnancy because peppermint can bring on menstruation.',
    locator: 'Frequently used herbal teas during pregnancy - Peppermint',
    instruction: 'Do not drink it in excess, particularly early in pregnancy.',
    conditions: [{ kind: 'frequency', instruction: 'Keep to modest amounts, especially in the first trimester.' }],
  },
  {
    subjectId: 'peppermint-tea',
    subjectKind: 'food',
    sourceId: 'babycenter',
    statusId: 'pregnancy-ok',
    summary: 'Peppermint tea is considered safe and is often used to settle an upset stomach, though it may not help morning sickness and has been linked to heartburn.',
    locator: 'Which teas are safe to drink while pregnant? - Peppermint tea',
  },
  {
    subjectId: 'peppermint-tea',
    subjectKind: 'food',
    sourceId: 'american-pregnancy-association',
    statusId: 'pregnancy-ok',
    summary: 'Peppermint leaf is rated likely safe and is used to relieve nausea, morning sickness and wind.',
    locator: 'The Herbs Used - Peppermint Leaf',
  },

  // Ginger: all three agree it is conditional, and each attaches a different condition.
  {
    subjectId: 'ginger-tea',
    subjectKind: 'food',
    sourceId: 'medeniyet-medical-journal',
    statusId: 'pregnancy-conditions',
    summary: 'Ginger relieves nausea and vomiting, but it stimulates the uterus and has been linked to bleeding, prematurity and a smaller head circumference at birth when used right through pregnancy.',
    locator: 'Frequently used herbal teas during pregnancy - Ginger',
    instruction: 'Use ginger in limited amounts, and tell your midwife or doctor if you take other medicines.',
    conditions: [
      { kind: 'frequency', instruction: 'The review puts the dose for nausea and vomiting at 1,000 mg a day, and not above 4 grams.' },
      { kind: 'other', instruction: 'Ginger interacts with insulin, metformin and nifedipine.' },
    ],
  },
  {
    subjectId: 'ginger-tea',
    subjectKind: 'food',
    sourceId: 'babycenter',
    statusId: 'pregnancy-conditions',
    summary: 'Ginger is commonly used to ease morning sickness and is generally considered safe, but the evidence of safety is not conclusive, so discuss it with your doctor or midwife.',
    locator: 'Which teas are safe to drink while pregnant? - Ginger tea',
    instruction: 'Talk it through with your doctor or midwife before relying on it.',
    conditions: [{ kind: 'other', instruction: 'The National Center for Complementary and Integrative Health says the evidence of safety is not conclusive.' }],
  },
  {
    subjectId: 'ginger-tea',
    subjectKind: 'food',
    sourceId: 'american-pregnancy-association',
    statusId: 'pregnancy-conditions',
    summary: 'Ginger root is rated possibly safe and is used to relieve nausea and vomiting.',
    locator: 'The Herbs Used - Ginger root',
  },

  // Raspberry leaf: all three conditional, and each draws the line in a different place.
  {
    subjectId: 'raspberry-leaf-tea',
    subjectKind: 'food',
    sourceId: 'babycenter',
    statusId: 'pregnancy-conditions',
    summary: 'Raspberry leaf has a long history of use in pregnancy without evidence of problems, but we do not know for sure that it is effective or completely safe.',
    locator: 'What about herbal teas made for pregnancy?',
    instruction: 'Skip it in the first trimester, then keep it to a couple of cups a day.',
    conditions: [{ kind: 'frequency', instruction: 'After the first trimester, have no more than a couple of cups a day.' }],
  },
  {
    subjectId: 'raspberry-leaf-tea',
    subjectKind: 'food',
    sourceId: 'american-pregnancy-association',
    statusId: 'pregnancy-conditions',
    summary: 'Red raspberry leaf is rated likely safe, but there is controversy about using it throughout pregnancy, so many providers recommend it only after the first trimester.',
    locator: 'The Herbs Used - Red Raspberry Leaf; Pregnancy Teas',
    instruction: 'Follow your provider’s advice on when in pregnancy to start.',
    conditions: [{ kind: 'other', instruction: 'Many providers stay cautious and recommend it only after the first trimester.' }],
  },
  {
    subjectId: 'raspberry-leaf-tea',
    subjectKind: 'food',
    sourceId: 'medeniyet-medical-journal',
    statusId: 'pregnancy-conditions',
    summary: 'The review places raspberry leaf in the use-with-caution category: no benefit to labour has been demonstrated, and one woman with gestational diabetes became hypoglycaemic after drinking it.',
    locator: 'Frequently used herbal teas during pregnancy - The red raspberry leaf',
    instruction: 'Tell your midwife or doctor before drinking it, particularly if you are managing gestational diabetes.',
    conditions: [{ kind: 'other', instruction: 'It may lower blood sugar, which matters if you are using insulin.' }],
  },

  // Lemon balm: only the American Pregnancy Association assessed it, and it rated it likely safe.
  // It is the one tea in the guide that resolves to a green status, on a single source.
  {
    subjectId: 'lemon-balm-tea',
    subjectKind: 'food',
    sourceId: 'american-pregnancy-association',
    statusId: 'pregnancy-ok',
    summary: 'Lemon balm is rated likely safe and has a calming effect that helps relieve irritability, insomnia and anxiety.',
    locator: 'The Herbs Used - Lemon Balm',
  },

  // Nettle: both sources say no, and the American Pregnancy Association records the dispute in its
  // own words rather than us summarising it away.
  {
    subjectId: 'nettle-tea',
    subjectKind: 'food',
    sourceId: 'babycenter',
    statusId: 'pregnancy-avoid',
    summary: 'Nettle is not recommended in pregnancy: it acts as a diuretic, it affects hormone metabolism, and it may contribute to miscarriage.',
    locator: 'Is it safe to drink herbal tea during pregnancy?; What about herbal teas made for pregnancy?',
  },
  {
    subjectId: 'nettle-tea',
    subjectKind: 'food',
    sourceId: 'american-pregnancy-association',
    statusId: 'pregnancy-avoid',
    summary: 'The Natural Medicines Database rates nettles likely unsafe, although the article notes that nettles appear in countless pregnancy teas and are recommended by most midwives and herbalists.',
    locator: 'The Herbs Used - Nettles (Stinging Nettles)',
  },

  // Fennel: both remaining sources qualify it rather than ruling it out.
  {
    subjectId: 'fennel-tea',
    subjectKind: 'food',
    sourceId: 'babycenter',
    statusId: 'pregnancy-conditions',
    summary: 'BabyCenter lists fennel among the teas to avoid in high doses.',
    locator: 'Teas to avoid during pregnancy - Fennel in high doses',
    instruction: 'Do not drink fennel tea in high doses.',
    conditions: [{ kind: 'frequency', instruction: 'Avoid high doses.' }],
  },
  {
    subjectId: 'fennel-tea',
    subjectKind: 'food',
    sourceId: 'medeniyet-medical-journal',
    statusId: 'pregnancy-conditions',
    summary: 'Fennel has oestrogenic effects, was toxic to fetal cells in laboratory testing, and two women who drank a fennel and cumin tea after birth developed liver damage.',
    locator: 'Frequently used herbal teas during pregnancy - Fennel (Foeniculum vulgare)',
    instruction: 'Treat fennel tea with caution and tell your midwife or doctor if you are taking other medicines.',
    conditions: [{ kind: 'other', instruction: 'Fennel inhibits liver enzymes that process other drugs, so it can interact with your medications.' }],
  },

  // Pregnancy blends: sold for pregnancy, and the two sources that address them disagree.
  {
    subjectId: 'pregnancy-tea-blends',
    subjectKind: 'food',
    sourceId: 'babycenter',
    statusId: 'pregnancy-conditions',
    summary: 'No clinical studies support the claims made for pregnancy teas, their ingredients are not regulated, and not all the herbs they contain are proven helpful or even safe.',
    locator: 'What about herbal teas made for pregnancy?',
    instruction: 'Read the ingredients and check the blend with your midwife or doctor before drinking it.',
    conditions: [
      { kind: 'composition', instruction: 'These blends usually include alfalfa, fennel seed, lemongrass, lemon verbena, nettle leaf, raspberry leaf, rose hips and strawberry leaf.' },
    ],
    reasonLinks: [
      { kind: 'contains', targetFoodId: 'nettle-tea', statement: 'Pregnancy blends often contain nettle, which BabyCenter says is not recommended in pregnancy:' },
    ],
  },
  {
    subjectId: 'pregnancy-tea-blends',
    subjectKind: 'food',
    sourceId: 'american-pregnancy-association',
    statusId: 'pregnancy-ok',
    summary: 'Pregnancy teas, which usually contain red raspberry leaf, are considered beneficial, and medical studies have shown red raspberry leaf can be consumed safely during pregnancy.',
    locator: 'Pregnancy Teas',
    reasonLinks: [
      { kind: 'contains', targetFoodId: 'raspberry-leaf-tea', statement: 'These blends are built around red raspberry leaf:' },
    ],
  },

  // Teas the American Pregnancy Association declines to judge. Nobody else assessed them, so the
  // entry says exactly that rather than implying a conditional verdict.
  {
    subjectId: 'dandelion-tea',
    subjectKind: 'food',
    sourceId: 'american-pregnancy-association',
    statusId: 'pregnancy-insufficient-evidence',
    summary: 'Dandelion is rated as having insufficient reliable information available, so talk to your midwife or doctor before drinking it.',
    locator: 'The Herbs Used - Dandelion',
  },
  {
    subjectId: 'rose-hip-tea',
    subjectKind: 'food',
    sourceId: 'american-pregnancy-association',
    statusId: 'pregnancy-insufficient-evidence',
    summary: 'Rose hips are rated as having insufficient reliable information available, so talk to your midwife or doctor before drinking them.',
    locator: 'The Herbs Used - Rose Hips',
  },

  ...avoidListSpecs.map(({ subjectId, sourceId, summary, locator }): TeaSpec => ({
    subjectId,
    subjectKind: 'food',
    sourceId,
    statusId: 'pregnancy-avoid',
    summary,
    locator,
  })),
]

export const teaAssessments: Assessment[] = teaSpecs.map(createTeaAssessment)
