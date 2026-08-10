import { assessments } from './assessments'
import { categories } from './categories'
import { foods } from './foods'
import { guidanceLists } from './guidanceLists'
import { preparations } from './preparations'
import { sources } from './sources'
import { validateContent } from '../domain/contentValidation'

export const content = validateContent({
  categories,
  foods,
  preparations,
  sources,
  guidanceLists,
  assessments,
})
