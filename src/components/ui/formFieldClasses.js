// Shared internal styling for Input/Textarea/Select — DESIGN_SYSTEM.md §9
// explicitly documents these three as sharing one style block
// (.form-input, .form-select, .form-textarea). Not exported from index.js —
// this is implementation detail, not a public component.

export const FIELD_BASE =
  'w-full rounded-md border border-hairline-strong bg-white px-3.5 py-3 ' +
  'font-body text-sm text-ink shadow-input transition-all duration-fast ease-brand ' +
  'placeholder:text-ink-muted ' +
  'focus:outline-none focus:border-ink focus:shadow-focus ' +
  'disabled:opacity-50 disabled:cursor-not-allowed'

export const FIELD_ERROR = 'border-error bg-error-bg'

export const FIELD_LABEL =
  'mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink'

export const FIELD_ERROR_TEXT = 'mt-1.5 text-xs text-error'
