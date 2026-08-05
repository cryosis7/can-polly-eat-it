import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from './App'

const renderAtPath = (path: string) => {
  window.history.pushState({}, '', path)
  return render(<App />)
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('App routes', () => {
  it('renders food guidance for a direct food route', () => {
    renderAtPath('/food/cheddar?v=1&list=pregnancy-food-safety')

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main-content')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
    expect(screen.getByRole('banner')).toHaveTextContent('general information, not medical advice')
    expect(screen.getByRole('heading', { name: 'Cheddar' })).toBeInTheDocument()
    expect(screen.getByText('OK to eat')).toBeInTheDocument()
  })

  it('renders the not-found page for an unknown route', () => {
    renderAtPath('/no-such-page')

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })
})
