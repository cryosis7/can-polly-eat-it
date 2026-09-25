import { createContentIndex, type ContentIndex } from '../domain/contentIndex'
import { validateContent, type ContentData } from '../domain/contentValidation'

/** The one way tests build an index. */
export const buildContentIndex = (content: Partial<ContentData>): ContentIndex => createContentIndex(validateContent({
  categories: [],
  foods: [],
  preparations: [],
  sources: [],
  guidanceLists: [],
  assessments: [],
  ...content,
}))
