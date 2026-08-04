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
  it('renders the food guidance placeholder for a direct food route', () => {
    renderAtPath('/food/cheddar?v=1&list=pregnancy-food-safety')

    expect(screen.getByRole('heading', { name: 'Food guidance' })).toBeInTheDocument()
    expect(screen.getByText(/Food detail guidance will be available/i)).toBeInTheDocument()
  })

  it('renders the not-found page for an unknown route', () => {
    renderAtPath('/no-such-page')

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })
})
