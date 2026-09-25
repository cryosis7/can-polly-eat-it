import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { content } from '../data'
import { App } from './App'

// Regenerate only for a change meant to alter what readers see: `npx vitest run -u src/app/contentOutline.test.tsx`.

const normalisedText = (element: Element): string => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  const parts: string[] = []
  for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
    const part = node.textContent!.replace(/\s+/g, ' ').trim()
    if (part !== '') {
      parts.push(part)
    }
  }
  return parts.join(' ')
}

const outline = (): string => [...screen.getByRole('main').querySelectorAll('h1, h2, h3, h4, h5, h6, .callout-list, .status, a[href]')]
  .map((element) => {
    if (element.matches('.callout-list')) {
      return `  list: ${normalisedText(element)}`
    }
    if (element.matches('.status')) {
      return `  status: ${normalisedText(element)}`
    }
    if (element.matches('a')) {
      return `  link: ${normalisedText(element)} -> ${element.getAttribute('href')}`
    }
    return `${element.tagName.toLowerCase()}: ${normalisedText(element)}`
  })
  .join('\n')

const renderAtPath = (path: string) => {
  window.history.pushState({}, '', path)
  render(<App />)
}

const expandCollapsed = (name: RegExp) => {
  for (const button of screen.queryAllByRole('button', { expanded: false, name })) {
    fireEvent.click(button)
  }
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('rendered outline under the default scopes', () => {
  it.each(content.foods.map((food) => food.slug))('/food/%s', (slug) => {
    renderAtPath(`/food/${slug}`)

    expect(outline()).toMatchSnapshot()
  })

  // Every category rather than only the assessed ones, so which categories are assessed is pinned too.
  it.each(content.categories.map((category) => category.slug))('/category/%s', (slug) => {
    renderAtPath(`/category/${slug}`)

    expect(outline()).toMatchSnapshot()
  })

  it('/ collapsed, with categories expanded, then with preparation bands expanded', () => {
    renderAtPath('/')
    expect(outline()).toMatchSnapshot('default')

    expandCollapsed(/, level \d+/)
    expect(outline()).toMatchSnapshot('categories expanded')

    expandCollapsed(/, \d+ entr(y|ies)$/)
    expect(outline()).toMatchSnapshot('preparation bands expanded')
  }, 30_000)
})
