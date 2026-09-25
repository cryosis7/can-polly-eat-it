import { assessments } from './assessments'
import { categories } from './categories'
import { foods } from './foods'
import { guidanceLists } from './guidanceLists'
import { preparations } from './preparations'
import { sources } from './sources'
import { validateContent, type ContentData } from '../domain/contentValidation'
import { createContentIndex } from '../domain/contentIndex'

const validatedContent = validateContent({
  categories,
  foods,
  preparations,
  sources,
  guidanceLists,
  assessments,
})

// Unbranded so that spreading and editing it cannot build an index without revalidating.
export const content: ContentData = validatedContent

export const contentIndex = createContentIndex(validatedContent)
