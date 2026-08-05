import { BrowserRouter, Route, Routes } from 'react-router'
import { content } from '../data'
import { CataloguePage } from '../features/catalogue/CataloguePage'
import { FoodDetailPage } from '../features/food-detail/FoodDetailPage'

export const disclaimer = 'This guide is general information, not medical advice. Ask your midwife, doctor, or another health professional for advice about your circumstances.'

const NotFound = () => (
  <main className="page-content">
    <h1>Page not found</h1>
    <p>Return to the food guide to keep browsing.</p>
  </main>
)

export const App = () => (
  <BrowserRouter>
    <div className="app-shell">
      <header className="site-header">
        <div className="content-width">
          <p className="eyebrow">Polly's Food Guide</p>
          <p className="site-disclaimer">{disclaimer}</p>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<CataloguePage content={content} />} />
        <Route path="/food/:foodSlug" element={<FoodDetailPage content={content} disclaimer={disclaimer} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  </BrowserRouter>
)
