import type { Source } from '../domain/schemas'

// ADR: Model guidance sources as attributed peers within a guidance list.
// See: docs/decisions/2026-08-08 ADR - model guidance sources as attributed peers within a guidance list.md
export const sources: Source[] = [
  {
    id: 'new-zealand-food-safety',
    slug: 'new-zealand-food-safety',
    name: 'New Zealand Food Safety',
    organisation: 'Ministry for Primary Industries',
    homeUrl: 'https://www.mpi.govt.nz/food-safety-home/food-pregnancy/',
  },
]
