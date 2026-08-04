import { Link } from 'react-router'
import { resolveAssessment } from '../../domain/assessment'
import { buildCategoryTree, flattenCategoryRows, foodsByCategoryId } from '../../domain/categoryTree'
import type { ContentData } from '../../domain/contentValidation'

type CataloguePageProps = {
  content: ContentData
}

const statusIcon = {
  green: 'OK',
  amber: '!',
  red: 'X',
  grey: '?',
} as const

const toneDescription = {
  green: 'reviewed as suitable',
  amber: 'requires care',
  red: 'not suitable',
  grey: 'not established as safe',
} as const

export const CataloguePage = ({ content }: CataloguePageProps) => {
  const guidanceList = content.guidanceLists[0]
  const tree = buildCategoryTree(content.categories)
  const categoryRows = flattenCategoryRows(tree)
  const foodsInCategory = foodsByCategoryId(content.foods)

  return (
    <main className="page-content content-width">
      <section aria-labelledby="guide-title" className="guide-intro">
        <p className="eyebrow">Food guide</p>
        <h1 id="guide-title">{guidanceList.title}</h1>
        <p>{guidanceList.description}</p>
        <dl className="status-key" aria-label="Status meanings">
          {guidanceList.statuses.map((status) => (
            <div key={status.id}>
              <dt><span aria-hidden="true" className={`status-icon tone-${status.tone}`}>{statusIcon[status.tone]}</span>{status.label}</dt>
              <dd>{toneDescription[status.tone]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="catalogue-heading">
        <h2 id="catalogue-heading">Browse foods</h2>
        <p className="result-count" aria-live="polite">{content.foods.length} foods in the guide</p>
        <div className="catalogue">
          {categoryRows.map(({ category, breadcrumb, depth }) => {
            const foods = foodsInCategory.get(category.id) ?? []
            if (foods.length === 0) {
              return null
            }
            return (
              <section
                aria-labelledby={`category-${category.id}`}
                className="category-group"
                key={category.id}
                style={{ '--category-indent': `${Math.min(depth, 6)}rem` } as React.CSSProperties}
              >
                <p className="breadcrumb">{breadcrumb}</p>
                <h3 id={`category-${category.id}`}>{category.name}</h3>
                <ul className="food-list">
                  {foods.map((food) => {
                    const resolved = resolveAssessment(food, guidanceList, content.assessments, content.categories)
                    const citation = resolved.assessment?.citations[0] ?? guidanceList.coverage.citations[0]
                    return (
                      <li className="food-card" key={food.id}>
                        <div className="food-card-header">
                          <h4><Link to={`/food/${food.slug}?v=1&list=${guidanceList.slug}`}>{food.name}</Link></h4>
                          <p className={`status tone-${resolved.status.tone}`}>
                            <span aria-hidden="true" className="status-icon">{statusIcon[resolved.status.tone]}</span>
                            <span>{resolved.status.label}</span>
                          </p>
                        </div>
                        <p>{resolved.assessment?.summary ?? 'This food has not been individually assessed in this guidance list.'}</p>
                        <a href={citation.url} target="_blank" rel="noreferrer">
                          Primary source: {citation.title}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      </section>
    </main>
  )
}
