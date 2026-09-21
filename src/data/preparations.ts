import type { Preparation } from '../domain/schemas'

// ADR: Model catalogue subjects and preparation independently.
// See: docs/decisions/2026-09-21 ADR - model catalogue subjects and preparation independently.md
//
// One global vocabulary, so `raw` means the same thing under fish, meat, and eggs. `sortOrder` is
// the display order on every surface, running from least processed to most, then pasteurisation,
// then provenance. `soft-serve` sits last by maintainer decision: it appears only under ice cream,
// where home-made, store-bought, soft serve reads as an escalation.
//
// A food declares which of these it is eaten in; a category's groupings are derived from its foods
// and its own preparation-qualified assessments, and are never authored.
//
// `cold-cooked`, `processed` and `soft-serve` exist because the (subject, preparation, list, source)
// uniqueness key forces them. Without them, `cold-cooked-poultry` and `processed-meats` would collide
// with `cooked-meats` on `meat-and-poultry`, and `soft-serve-ice-cream` would collide with its
// siblings on `ice-cream`, merging separately authored assessments.
export const preparations: Preparation[] = [
  { id: 'raw', slug: 'raw', name: 'Raw', sortOrder: 1 },
  { id: 'fresh', slug: 'fresh', name: 'Fresh', sortOrder: 2 },
  { id: 'frozen', slug: 'frozen', name: 'Frozen', sortOrder: 3 },
  { id: 'dried', slug: 'dried', name: 'Dried', sortOrder: 4 },
  { id: 'smoked', slug: 'smoked', name: 'Smoked', sortOrder: 5 },
  { id: 'cooked', slug: 'cooked', name: 'Cooked', sortOrder: 6 },
  { id: 'cold-cooked', slug: 'cold-cooked', name: 'Cold cooked', sortOrder: 7 },
  { id: 'processed', slug: 'processed', name: 'Processed', sortOrder: 8 },
  { id: 'pasteurised', slug: 'pasteurised', name: 'Pasteurised', sortOrder: 9 },
  { id: 'unpasteurised', slug: 'unpasteurised', name: 'Unpasteurised', sortOrder: 10 },
  { id: 'home-made', slug: 'home-made', name: 'Home-made', sortOrder: 11 },
  { id: 'store-bought', slug: 'store-bought', name: 'Store-bought', sortOrder: 12 },
  { id: 'soft-serve', slug: 'soft-serve', name: 'Soft serve', sortOrder: 13 },
]
