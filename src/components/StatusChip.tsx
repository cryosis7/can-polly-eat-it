import type { StatusDefinition } from '../domain/schemas'

const statusIcon = {
  green: 'OK',
  amber: '!',
  red: 'X',
  grey: '?',
} as const

/**
 * The RAG indicator and its list-owned label. The icon carries the meaning for anyone who cannot
 * see the tone, so status is never signalled by colour alone.
 */
export const StatusChip = ({ status }: { status: StatusDefinition }) => (
  <p className={`status tone-${status.tone}`}>
    <span aria-hidden="true" className="status-icon">{statusIcon[status.tone]}</span>
    <span>{status.label}</span>
  </p>
)
