import type { GuidanceLayer } from '../domain/assessment'

/**
 * The words naming what a layer covers: the authored scope statement of a category rule, or the
 * subject itself where the rule was authored directly onto it.
 *
 * Shared so that the catalogue entry and the detail section cannot label the same layer differently.
 */
export const layerLabel = (layer: GuidanceLayer): string =>
  layer.assessment.scopeStatement ?? 'Specific to this food'
