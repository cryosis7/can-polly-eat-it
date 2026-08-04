import { describe, expect, it } from 'vitest'
import { content } from '../data'
import { resolveAssessment } from './assessment'
import { validateContent } from './contentValidation'

describe('guide content validation', () => {
  it('accepts the authored fixture content', () => {
    expect(content.foods).toHaveLength(5)
    expect(content.guidanceLists).toHaveLength(1)
  })

  it('rejects duplicate category slugs', () => {
    expect(() => validateContent({
      ...content,
      categories: [...content.categories, { ...content.categories[0], id: 'another-dairy' }],
    })).toThrow('duplicate category slug')
  })

  it('resolves in-coverage and outside-coverage missing assessments differently', () => {
    const list = content.guidanceLists[0]
    const yoghurt = content.foods.find((food) => food.id === 'yoghurt')!
    const kombucha = content.foods.find((food) => food.id === 'kombucha')!

    expect(resolveAssessment(yoghurt, list, content.assessments, content.categories).status.label).toBe('Not assessed')
    expect(resolveAssessment(kombucha, list, content.assessments, content.categories).status.label).toBe('Outside current coverage')
  })
})
