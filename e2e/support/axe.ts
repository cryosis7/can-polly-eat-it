import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'
import type { Result } from 'axe-core'

const wcag22aaTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

export const mobileViewport = { width: 320, height: 720 }
export const desktopViewport = { width: 1280, height: 800 }

const describeViolation = (violation: Result) => {
  const targets = violation.nodes.map((node) => node.target.join(' ')).join('\n      ')

  return `  ${violation.id} (${violation.impact ?? 'unknown impact'}): ${violation.help}\n    ${violation.helpUrl}\n    targets:\n      ${targets}`
}

/**
 * Scans the current page for WCAG 2.2 AA violations and fails with the offending
 * rule IDs and target selectors, so a failure is diagnosable without the trace.
 */
export const expectNoAccessibilityViolations = async (page: Page) => {
  const { violations } = await new AxeBuilder({ page }).withTags(wcag22aaTags).analyze()

  expect(
    violations,
    violations.length === 0
      ? 'No accessibility violations expected.'
      : `Found ${violations.length} WCAG 2.2 AA violation(s) at ${page.url()}:\n${violations.map(describeViolation).join('\n')}`,
  ).toEqual([])
}
