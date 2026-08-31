import type { Source } from '../domain/schemas'

// ADR: Model guidance sources as attributed peers within a guidance list.
// See: docs/decisions/2026-08-08 ADR - model guidance sources as attributed peers within a guidance list.md
//
// Declaration order is the tie-break order when two sources reach statuses of equal caution, so it
// is display determinism rather than a ranking: both positions are still shown and named. New
// Zealand Food Safety leads as the local regulator, followed by the peer-reviewed review, then the
// consumer-health publishers.
export const sources: Source[] = [
  {
    id: 'new-zealand-food-safety',
    slug: 'new-zealand-food-safety',
    name: 'New Zealand Food Safety',
    organisation: 'Ministry for Primary Industries',
    homeUrl: 'https://www.mpi.govt.nz/food-safety-home/food-pregnancy/',
  },
  {
    id: 'medeniyet-medical-journal',
    slug: 'medeniyet-medical-journal',
    name: 'Medeniyet Medical Journal',
    organisation: 'İstanbul Medeniyet University, School of Medicine',
    homeUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7384490/',
  },
  {
    id: 'american-pregnancy-association',
    slug: 'american-pregnancy-association',
    name: 'American Pregnancy Association',
    organisation: 'American Pregnancy Association',
    homeUrl: 'https://americanpregnancy.org/pregnancy/herbal-tea/',
  },
  {
    id: 'babycenter',
    slug: 'babycenter',
    name: 'BabyCenter',
    organisation: 'BabyCenter, L.L.C.',
    homeUrl: 'https://www.babycenter.com/pregnancy/diet-and-fitness/herbal-teas-during-pregnancy_3537',
  },
  {
    id: 'nsw-food-authority',
    slug: 'nsw-food-authority',
    name: 'NSW Food Authority',
    organisation: 'NSW Department of Primary Industries and Regional Development',
    homeUrl: 'https://www.foodauthority.nsw.gov.au/consumer/life-events-and-food/pregnancy/foods-to-eat-or-avoid-when-pregnant',
  },
]
