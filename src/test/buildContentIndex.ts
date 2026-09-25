import { createContentIndex, type ContentIndex } from '../domain/contentIndex'
import { validateContent, type ContentData } from '../domain/contentValidation'

/** The one way tests build an index: missing collections default to empty, and validation always runs. */
export const buildContentIndex = (content: Partial<ContentData>): ContentIndex => createContentIndex(validateContent({
  categories: [],
  foods: [],
  preparations: [],
  sources: [],
  guidanceLists: [],
  assessments: [],
  ...content,
}))
